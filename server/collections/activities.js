ActivityViews = new View('activitiesView', {
  collection: Activities,
  mapping: function (activity) {
      switch (activity.type) {
        case   (Enums.activitiesType.contactableAdd):
          return {
            cursor:  Contactables.find(activity.entityId),
            name: 'contactables'
          };
          break;
        case   (Enums.activitiesType.messageAdd):
          break;
        case   (Enums.activitiesType.taskAdd):
          return Tasks.find(activity.entityId);
          break;
        case   (Enums.activitiesType.jobAdd):
          return Jobs.find(activity.entityId);
          break;
        case   (Enums.activitiesType.placementEdit):
          break;
        case   (Enums.activitiesType.placementAdd):
          break;
        case   (Enums.activitiesType.dealAdd):
          break;
      }
    }
});

Meteor.publish('', function () {
  return Utils.filterCollectionByUserHier.call(this, ActivityViews.find({},{sort: {dateCreated:-1}}));
},{
  infiniteScroll: true,
  pageSize: 20,
  publicationName: 'activities'
});

var mainTypes = ['Employee','Contact','Customer'];

// Contactable

Contactables.after.insert(function (userId, doc) {
	var data = {};
	data.dateCreated = doc.dateCreated;
	data.objTypeName = _.find(doc.objNameArray,function(item){
        return  mainTypes.indexOf(item)>=0
    });

	if (doc.person) {
		data.displayName = doc.person.lastName + ', ' + doc.person.firstName + ' ' + doc.person.middleName;
		data.person = {
			jobTitle: doc.person.jobTitle
		}
	} else {
    data.displayName = doc.organization.organizationName;
	}
	Activities.insert({
		userId: userId,
		hierId: doc.hierId,
		type: Enums.activitiesType.contactableAdd,
		entityId: doc._id,
		data: data
	})
});

// Message

Messages.after.insert(function (userId, doc) {
	_.forEach(doc.entityIds, function (entity) {
		Activities.insert({
			userId: userId,
			hierId: Meteor.user().hierId,
			type: Enums.activitiesType.messageAdd,
			entityId: entity,
			data: {
				message: doc.message,
				dateCreated: doc.dateCreated
			}
		})
	})
});

// Tasks

Tasks.after.insert(function (userId, doc) {
  var linkid;
  if (doc.links.length>0) linkid=links[0].id;
  Activities.insert({
		userId: doc.userId,
		hierId: doc.hierId,
		type: Enums.activitiesType.taskAdd,
		entityId: linkid,
		data: {
			note: doc.note,
			dateCreated: doc.dateCreated,
			begin: doc.begin,
			end: doc.end,
			completed: doc.completed,
			assign: doc.assign,
		}
	})
});

// Jobs

Jobs.after.insert(function (userId, doc) {
	var customerName = "";
	var customer = Contactables.findOne({
		_id: doc.customer
	});
	if (customer)
//		if (customer.person) {
//			customerName = customer.person.lastName + ', ' + customer.person.firstName + ' ' + customer.person.middleName;
//
//		} else {
//			customerName = customer.displayName = customer.organization.organizationName;
//		}

	Activities.insert({
		userId: userId,
		hierId: doc.hierId,
		type: Enums.activitiesType.jobAdd,
		entityId: doc._id,
		data: {
			publicJobTitle: doc.publicJobTitle,
			customerId: doc.customer,
      dateCreated : doc.dateCreated
		}
	});
});

//Placements

Placements.after.insert(function (userId, doc) {
  var data = {};
  data.dateCreated = new Date();
  data.job=doc.job;
  data.employee=doc.employee;

  var placementStatus = LookUps.findOne(doc.placementStatus);
  var type = Enums.activitiesType.placementAdd;
  console.log(placementStatus);

  if (_.contains(placementStatus.lookUpActions, Enums.lookUpAction.Placement_Assigned)){
    type = Enums.activitiesType.placementAdd;
    console.log('placementAdd')
  }else if(_.contains(placementStatus.lookUpActions, Enums.lookUpAction.Placement_Candidate)){
    type = Enums.activitiesType.candidateAdd;
    console.log('candidateAdd')

  }
  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: type,
    entityId: doc._id,
    data: data
  })
});
Placements.after.update(function (userId, doc) {
  var data = {};
  data.dateCreated = new Date();
  data.job = doc.job;
  data.employee = doc.employee;
  data.oldJob = this.previous.job;
  data.oldEmployee = this.previous.employee;


  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.placementEdit,
    entityId: doc._id,
    data: data
  })
});

// Users

Meteor.startup(function () {
  Meteor.methods({
    userLoginActivity: function () {
      var data={};
      data.username=Meteor.user().username;
      data.dateCreated=new Date();
      if (Meteor.user()) {
        Activities.insert({
          userId: Meteor.user()._id,
          hierId: Meteor.user().hierId,
          type: Enums.activitiesType.userLogin,
          entityId: Meteor.user()._id,
          data: data
        });
      }
    }
  })
});

// Indexes

Activities._ensureIndex({hierId: 1});
