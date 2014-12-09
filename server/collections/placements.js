
PlacementView = new View('placements', {
  collection: Placements,
  cursors: function (placement) {
    // Job with Customer
    this.publish({
      cursor: function (placement) {
        if (placement.job)
          return JobPlacementView.find(placement.job);
      },
      to: 'jobs',
      observedProperties: ['job'],
      onChange: function (changedProps, oldSelector) {
        return JobPlacementView.find(changedProps.job);
      }
    });

    // Employee
    this.publish({
      cursor: function (placement) {
        if (placement.employee){
          return Contactables.find(placement.employee);
        }
      },
      to: 'contactables',
      observedProperties: ['employee'],
      onChange: function (changedProps, oldSelector) {
        return Contactables.find(changedProps.employee);
      }
    });
  }
});
Meteor.paginatedPublish(PlacementView, function(){
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return false;
  return Utils.filterCollectionByUserHier.call(this, PlacementView.find());
}, {
  pageSize: 15,
  publicationName: 'placements'
});

Meteor.publish('placementDetails', function (id) {
  return Utils.filterCollectionByUserHier.call(this, PlacementView.find(id));
});

Meteor.publish('allPlacements', function () {
  var sub = this;
  PlacementView.publishCursor(Utils.filterCollectionByUserHier.call(this, PlacementView.find({},{
    fields: {
      status: 1,
      employee: 1,
      job: 1,
      candidateStatus: 1
    }
  })), sub, 'allPlacements');
  sub.ready();
});

Placements.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Placements.before.insert(function (userId, doc) {
  try{
    var user = Meteor.user() || {};
  }catch (e){
    //when the insert is trigger from the server
    var user= { }
  }
  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.npmRequire('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
});

Placements.after.insert(function(userId, doc){
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            placement: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            placement: doc._id
        }
    });
});

Placements.after.update(function(userId, doc){
  if (doc.employee != this.previous.employee){

    Contactables.update({
      _id: this.previous.employee
    }, {
      $set: {
        placement: null
      }
    });

    Contactables.update({
      _id: doc.employee
    }, {
      $set: {
        placement: doc._id
      }
    });
  }

});


// add some employee fields for placement sorting
Placements.before.insert(function (userId, doc) {
  var employee = doc.employee && Contactables.findOne(doc.employee);
  if (employee){
    doc.employeeInfo = {
      firstName: employee.person.firstName,
      lastName: employee.person.lastName,
      middleName: employee.person.middleName
    }
  }
});
Placements.after.update(function (userId, doc) {
  if (doc.employee != this.previous.employee){

    var employee = doc.employee && Contactables.findOne(doc.employee);
    if (employee) {
      var employeeInfo = {
        firstName: employee.person.firstName,
        lastName: employee.person.lastName,
        middleName: employee.person.middleName
      };
      Placements.update({
        _id: doc._id
      }, {
        $set: {employeeInfo: employeeInfo}
      });
    }
  }
});

Contactables.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (doc.Employee && _.contains(fieldNames, 'person') && Placements.find({employee: doc._id}).count()){

    var self = this;
    var newEmployeeInfo = {};
    _.each(['firstName', 'lastName', 'middleName'], function (key) {
      if (doc.person[key] && doc.person[key] !== self.previous.person[key]){
        newEmployeeInfo['employeeInfo.' + key] = doc.person[key];
      }
    });

    if (!_.isEmpty(newEmployeeInfo)){
      Placements.update({employee: doc._id}, {
        $set: newEmployeeInfo
      },{multi: true});
    }
  }
});