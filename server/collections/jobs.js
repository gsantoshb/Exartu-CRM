
JobView = new View('jobs', {
  collection: Jobs,
  cursors: function (job) {
    // Customer
    this.publish({
      cursor: function (job) {
        if (job.customer)
          return Contactables.find(job.customer, { fields: { 'organization.organizationName' : 1 } });
      },
      to: 'contactables',
      observedProperties: ['customer'],
      onChange: function (changedProps, oldSelector) {
        oldSelector._id = changedProps.customer;
        return Contactables.find(oldSelector, { fields: { 'organization.organizationName': 1 } });
      }
    });

    // Publish the three most recent placements
    var placements = Placements.find({job: job._id}, { fields: { 'employee' : 1, 'job': 1 }, sort: { dateCreated: -1 }});
    var employeeIds = placements.fetch().map(function (p) {return p.employee;});

    this.publish({
      cursor: function () {
        return placements;
      },
      to: 'placements'
    });

    // Employees
    this.publish({
      cursor: function () {
        return Contactables.find({_id: { $in: employeeIds}});
      },
      to: 'contactables'
    });

  }
});

Meteor.paginatedPublish(JobView, function(){
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return false;
  return JobView.find();
}, {
  pageSize: 15,
  publicationName: 'jobs'
});

Meteor.publish('singleJob', function (id) {
  return Utils.filterCollectionByUserHier.call(this, JobView.find(id));
});

Meteor.publish('allJobs', function () {
  var sub = this;
  Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Jobs.find({},{
    fields:{
      publicJobTitle: 1
    }
  })), sub, 'allJobs');
  sub.ready();
});

Jobs.allow({
  update: function () {
    return true;
  }
});

Jobs.before.insert(function (userId, doc) {
  try {
    var user = Meteor.user() || {};
  } catch (e) {
    var user = {}
  }
  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.npmRequire('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
});

// Indexes

Jobs._ensureIndex({hierId: 1});
Jobs._ensureIndex({objNameArray: 1});

//// View
//
//JobView = new Meteor.Collection('JobView', {
//  collection: Jobs,
//  mapping: {
//    customerInfo: {
//      find: function(job) {
//        return Contactables.find(job.customerId,{
//          fields: {
//            'organization.organizationName': 1
//          }
//        });
//      },
//      map: function (doc) {
//        if (! doc) return null;
//
//        return {
//          id: doc._id,
//          displayName: doc.organization.organizationName
//        };
//      }
//    }
//  }
//});
