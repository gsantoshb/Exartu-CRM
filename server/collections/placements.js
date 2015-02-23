
PlacementView = new View('placements', {
  collection: Placements,
  cursors: function (placement) {
    // Job with Client
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
    return [];
  return Utils.filterCollectionByUserHier.call(this, PlacementView.find());
}, {
  pageSize: 50,
  publicationName: 'placements',
  updateSelector: function (selector, params) {
    if (!params || !params.searchString) return selector;

    var searchStringSelector = {$or: []};

    // Search employees
    // person properties query
    var personFields = ['firstName', 'lastName', 'middleName', 'jobTitle', 'salutation'];
    var employeeQuery = generateQueryFromFields('person', personFields, params.searchString);
    employeeQuery.objNameArray = 'Employee';
    // get id of employees that have a placement
    var employeesId = Utils.filterCollectionByUserHier.call(this, Placements.find()).map(function (placements) { return placements.employee; });
    employeeQuery._id = {$in: employeesId};
    // search employees with a placement with properties that match string
    var employees = Utils.filterCollectionByUserHier.call(this, Contactables.find(employeeQuery)).map(function (employee) { return employee._id; });
    searchStringSelector.$or.push({employee: {$in: employees}});

    // Search jobs
    // job properties query
    var jobFields = ['publicJobTitle'];
    var jobQuery = generateQueryFromFields(undefined, jobFields, params.searchString);
    // get id of jobs that have a placement
    var jobsId = Utils.filterCollectionByUserHier.call(this, Placements.find()).map(function (placements) { return placements.job; });
    jobQuery._id = {$in: jobsId};
    // search jobs with a placement with properties that match string
    var jobs = Utils.filterCollectionByUserHier.call(this, Jobs.find(jobQuery)).map(function (job) { return job._id; });
    searchStringSelector.$or.push({job: {$in: jobs}});

    // Search client
    // organization properties query
    var organizationFields = ['organizationName'];
    var clientQuery = generateQueryFromFields('organization', organizationFields, params.searchString);
    clientQuery.objNameArray = 'Client';
    // get id of jobs' client of those which has a placement
    var clientIds = Jobs.find({_id: {$in: jobsId}}).map(function (job){ return job.client; });
    clientQuery._id = {$in: clientIds};
    // search clients with a placement with properties that match string
    var clients = Utils.filterCollectionByUserHier.call(this, Contactables.find(clientQuery)).map(function (client) { return client._id; });
    // now get id of jobs with client id in clients
    var clientJobsId = Jobs.find({client: {$in: clients}}).map(function (job) { return job._id; });
    searchStringSelector.$or.push({job: {$in: clientJobsId}});

    // Merge with client selector
    if (! selector.$or) {
      selector.$or = searchStringSelector.$or;
    } else {
      selector.$and = selector.$and || [];
      selector.$and.push({$or: selector.$or});
      selector.$and.push({$or: searchStringSelector.$or});
      delete selector.$or;
    }
    return selector;

    function generateQueryFromFields(root, fields, string) {
      var q = {$or: []};
      _.forEach(fields, function (f) {
        var fq = {};
        fq[(root? root + '.' : '') + f] = {
          $regex: '.*' + string + '.*',
          $options: 'i'
        };
        q.$or.push(fq);
      });
      return q;
    }
  }
});

Meteor.publish('placementDetails', function (id) {
  return Utils.filterCollectionByUserHier.call(this, PlacementView.find(id));
});

Meteor.publish('allPlacements', function () {
  var sub = this;
  Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Placements.find({},{
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
  if (!doc.activeStatus) doc.activeStatus=LookUpManager.getActiveStatusDefaultId();

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
Placements._ensureIndex({dateCreated: 1});
Placements._ensureIndex({activeStatus: 1});
Placements._ensureIndex({userId: 1});
Placements._ensureIndex({hierId: 1});
Placements._ensureIndex({objNameArray: 1});
Placements._ensureIndex({candidateStatus: 1});