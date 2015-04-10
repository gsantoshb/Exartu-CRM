ActivityViews = new View('activities', {
  collection: Activities,
  cursors: function (activity) {
    var self = this;
    var hierId = activity.hierId; // we are getting the corresponding hierId for the current cursor object

    var contactablesToPublish = [];
    var tasksToPublish = [];
    var jobsToPublish = [];
    var placementsToPublish = [];
    var notesToPublish = [];
    var filesToPublish = [];
    //clasify by activity type and add to the array if it wasn't added yet
    if ((activity.type === Enums.activitiesType.contactableAdd) && (contactablesToPublish.lastIndexOf(activity.entityId) === -1)) {
      contactablesToPublish.push(activity.entityId);
    }
    else if ((activity.type === Enums.activitiesType.taskAdd) && (tasksToPublish.lastIndexOf(activity.entityId) === -1)) {
      tasksToPublish.push(activity.entityId);
    }
    else if ((activity.type === Enums.activitiesType.noteAdd) && (notesToPublish.lastIndexOf(activity.entityId) === -1)) {
      notesToPublish.push(activity.entityId);
    }
    else if ((activity.type === Enums.activitiesType.jobAdd) && (jobsToPublish.lastIndexOf(activity.entityId) === -1)) {
      jobsToPublish.push(activity.entityId);
    }
    else if ((activity.type === Enums.activitiesType.fileAdd) && (filesToPublish.lastIndexOf(activity.entityId) === -1)) {
      filesToPublish.push(activity.entityId);
      if (contactablesToPublish.lastIndexOf(activity.links[0]) === -1) {
        contactablesToPublish.push(activity.links[0].id);
      }
    }
    else if ((activity.type === Enums.activitiesType.placementAdd || activity.type === Enums.activitiesType.placementEdit) && (placementsToPublish.lastIndexOf(activity.entityId) === -1)) {
      placementsToPublish.push(activity.entityId);
      if (jobsToPublish.lastIndexOf(activity.links[1]) === -1) {
        jobsToPublish.push(activity.links[1]);
      }
      if (contactablesToPublish.lastIndexOf(activity.links[2]) === -1) {
        contactablesToPublish.push(activity.links[0].id);
      }

    }
    //now resolve links and publish:

    //tasks Cursor
    var tasksCursor = Tasks.find({_id: {$in: tasksToPublish}});
    self.publish({cursor: tasksCursor, to: 'tasks'});
    var tasksArray = tasksCursor.fetch();
    _.forEach(tasksArray, function (t) {
      _.forEach(t.links, function (link) {
        switch (link.type) {
          case Enums.linkTypes.contactable.value:
            if (contactablesToPublish.lastIndexOf(link.id) === -1) {
              contactablesToPublish.push(link.id);
            }
            break;
          case Enums.linkTypes.job.value:
            if (jobsToPublish.lastIndexOf(link.id) === -1) {
              jobsToPublish.push(link.id);
            }
            break;
          case Enums.linkTypes.placement.value:
            if (placementsToPublish.lastIndexOf(link.id) === -1) {
              placementsToPublish.push(link.id);
            }
            break;
        }
      })
    });


    //notes cursor
    var notesCursor = Notes.find({_id: {$in: notesToPublish}});
    self.publish({cursor: notesCursor, to: 'notes'});
    var notesArray = notesCursor.fetch();
    _.forEach(notesArray, function (n) {
      _.forEach(n.links, function (link) {
        switch (link.type) {
          case Enums.linkTypes.contactable.value:
            if (contactablesToPublish.lastIndexOf(link.id) === -1) {
              contactablesToPublish.push(link.id);
            }
            break;
          case Enums.linkTypes.job.value:
            if (jobsToPublish.lastIndexOf(link.id) === -1) {
              jobsToPublish.push(link.id);
            }
            break;
          case Enums.linkTypes.placement.value:
            if (placementsToPublish.lastIndexOf(link.id) === -1) {
              placementsToPublish.push(link.id);
            }
            break;
        }
      })
    });


    //contactablesFiles cursor
    var contactablesFilesCursor = ContactablesFiles.find({_id: {$in: filesToPublish}});
    self.publish({cursor: contactablesFilesCursor, to: 'contactablesFiles'});


    //placements cursor
    var placementsFilesCursor = Placements.find({_id: {$in: placementsToPublish}});
    self.publish({cursor: placementsFilesCursor, to: 'placements'});

    //jobs cursor
    var jobsFilesCursor = Jobs.find({_id: {$in: jobsToPublish}});
    self.publish({cursor: jobsFilesCursor, to: 'jobs'});

    //contactable cursor
    var contactablesCursor = Contactables.find({_id: {$in: contactablesToPublish}});
    self.publish({cursor: contactablesCursor, to: 'contactables'});


    //place







    //var self = this;
    //
    //// Contactables
    //this.publish({
    //    cursor: function (activity) {
    //        if (activity.type === Enums.activitiesType.contactableAdd) {
    //            return Contactables.find({_id: activity.entityId});
    //        }
    //    },
    //    to: 'contactables'
    //});
    //
    //// Tasks
    //this.publish({
    //    cursor: function (activity) {
    //        if (activity.type === Enums.activitiesType.taskAdd) {
    //            return Tasks.find({_id: activity.data.taskId});
    //        }
    //    },
    //    to: 'tasks'
    //});
    //
    //// Jobs
    //this.publish({
    //    cursor: function (activity) {
    //        if (activity.type === Enums.activitiesType.jobAdd) {
    //            return Jobs.find({_id: activity.entityId});
    //        }
    //    },
    //    to: 'jobs'
    //});
    //
    //// File uploads
    //if (activity.type === Enums.activitiesType.fileAdd) {
    //    _.forEach(activity.links, function (link) {
    //        switch (link.type) {
    //            case Enums.linkTypes.contactable.value:
    //                self.publish({
    //                    cursor: function () {
    //                        return Contactables.find({_id: link.id});
    //                    },
    //                    to: 'contactables'
    //                });
    //                break;
    //            case Enums.linkTypes.job.value:
    //                self.publish({
    //                    cursor: function () {
    //                        return Jobs.find({_id: link.id});
    //                    },
    //                    to: 'jobs'
    //                });
    //                break;
    //            case Enums.linkTypes.placement.value:
    //                self.publish({
    //                    cursor: function () {
    //                        return Placements.find({_id: link.id});
    //                    },
    //                    to: 'placements'
    //                });
    //                break;
    //        }
    //    });
    //}
    //
    //// Notes
    //if (activity.type === Enums.activitiesType.noteAdd) {
    //    var c = Notes.find({_id: activity.entityId});
    //
    //    // Publish links
    //    var note = c.fetch()[0];
    //
    //    if (note) {
    //        var links = _.pluck(note.links, 'id');
    //        var types = _.pluck(note.links, 'type');
    //        _.forEach(types, function (t) {
    //            switch (t) {
    //                case Enums.linkTypes.contactable.value:
    //                    self.publish({
    //                        cursor: function () {
    //                            return Contactables.find({_id: {$in: links}});
    //                        },
    //                        to: 'contactables'
    //                    });
    //                    break;
    //                case Enums.linkTypes.job.value:
    //                    self.publish({
    //                        cursor: function () {
    //                            return Jobs.find({_id: {$in: links}});
    //                        },
    //                        to: 'jobs'
    //                    });
    //                    break;
    //                case Enums.linkTypes.placement.value:
    //                    self.publish({
    //                        cursor: function () {
    //                            return Placements.find({_id: {$in: links}});
    //                        },
    //                        to: 'placements'
    //                    });
    //                    break;
    //            }
    //        });
    //    }
    //    this.publish({
    //        cursor: function (activity) {
    //            return c;
    //        },
    //        to: 'notes'
    //    });
    //}
    //
    //if (activity.type === Enums.activitiesType.taskAdd) {
    //    var c = Tasks.find({_id: activity.entityId});
    //
    //    // Publish links
    //    var task = c.fetch()[0];
    //
    //    if (task) {
    //        var links = _.pluck(task.links, 'id');
    //        var types = _.pluck(task.links, 'type');
    //        _.forEach(types, function (t) {
    //            switch (t) {
    //                case Enums.linkTypes.contactable.value:
    //                    self.publish({
    //                        cursor: function () {
    //                            return Contactables.find({_id: {$in: links}}); //try all keys regardless of type since doesn't matter
    //                        },
    //                        to: 'contactables'
    //                    });
    //                    break;
    //                case Enums.linkTypes.job.value:
    //                    self.publish({
    //                        cursor: function () {
    //                            return Jobs.find({_id: links});
    //                        },
    //                        to: 'jobs'
    //                    });
    //                    break;
    //                case Enums.linkTypes.placement.value:
    //                    self.publish({
    //                        cursor: function () {
    //                            return Placements.find({_id: links});
    //                        },
    //                        to: 'placements'
    //                    });
    //                    break;
    //            }
    //        });
    //    }
    //    this.publish({
    //        cursor: function (activity) {
    //            return c;
    //        },
    //        to: 'tasks'
    //    });
    //}
    //
    //if (activity.type === Enums.activitiesType.fileAdd) {
    //    var c = ContactablesFiles.find({_id: activity.entityId});
    //
    //    // Publish links
    //    var file = c.fetch()[0];
    //
    //    if (file) {
    //        self.publish({
    //            cursor: function () {
    //                return Contactables.find(file.entityId);
    //            },
    //            to: 'contactables'
    //        });
    //    }
    //    ;
    //    this.publish({
    //        cursor: function (activity) {
    //            return c;
    //        },
    //        to: 'contactablesFiles'
    //    });
    //}
    //
    ////Placements
    //if (activity.type === Enums.activitiesType.placementAdd || activity.type === Enums.activitiesType.placementEdit) {
    //    var placementCursor = Placements.find(activity.entityId);
    //    var placement = placementCursor.fetch()[0];
    //    var jobCursor = Jobs.find(placement.job);
    //    var job = jobCursor.fetch()[0];
    //    var clientCursor = Contactables.find(job.client);
    //    var employeeCursor = Contactables.find(placement.employee);
    //
    //    this.publish({
    //        cursor: function () {
    //            return placementCursor;
    //        },
    //        to: 'placements'
    //    });
    //
    //    this.publish({
    //        cursor: function () {
    //            return jobCursor;
    //        },
    //        to: 'jobs'
    //    });
    //
    //    this.publish({
    //        cursor: function () {
    //            return clientCursor;
    //        },
    //        to: 'contactables'
    //    });
    //
    //    this.publish({
    //        cursor: function () {
    //            return employeeCursor;
    //        },
    //        to: 'contactables'
    //    });
    //}




  }
});

ChartActivityViews = new View('chartActivities', {
  collection: Activities,
  cursors: function(activity) {}
});

Meteor.paginatedPublish(ActivityViews, function () {
    //@todo review this, is not working properly
    var activities = Utils.filterCollectionByUserHier.call(this, ActivityViews.find({}, {sort: {'data.dateCreated': -1}}));
    return activities;
  },
  {
    infiniteScroll: true,
    pageSize: 30,
    publicationName: 'activities',
    updateSelector: function (oldSelector, clientParams) {
      var newSelector = EJSON.clone(oldSelector);
      delete newSelector.entityId;  // hack since pagination plugin is not correctly using the original cursor selector

      if (clientParams && clientParams.searchString) {
        // Get ids of entities that match the searchString
        var userHier = Utils.getUserHierId(this.userId);
        var ids = ActivityManager.searchActivities(clientParams.searchString, userHier);
        newSelector.entityId = { $in: ids };
      }

      var activityTypes = newSelector.type.$in;
      newSelector.type.$in = [];
      _.each(activityTypes, function(activityType){
        newSelector.type.$in.push(parseInt(activityType));
      });

      return newSelector;
    }
  }
);

Meteor.publish('getChartActivities', function() {
  return Utils.filterCollectionByUserHier.call(this, ChartActivityViews.find({ type: { $in: [0,2,5,3,10,12] } }));
});

Meteor.publish('getActivities', function(query, options){
  //console.log(options);
  //console.log(query);
  var searchQuery = {};

  var types = [];
  _.each(query.type.$in, function(type) {
    types.push(parseInt(type));
  });

  searchQuery = {type: {$in: types}};

  if(query && query.searchString) {
    var userHier = Utils.getUserHierId(this.userId);
    var ids = ActivityManager.searchActivities(query.searchString, userHier);
    searchQuery = {
      $and: [
        { type: { $in: types } },
        { entityId: { $in: ids } }
      ]
    }
  }

  var activitiesCursor = ActivityViews.find(searchQuery, options);
  if(options.limit > activitiesCursor.count()) {
    options.limit = 0;
  }

  var activities = Utils.filterCollectionByUserHier.call(this, activitiesCursor);
  return activities;
});

var mainTypes = ['Employee', 'Contact', 'Client'];

// Contactable

Contactables.after.insert(function (userId, doc) {
  var data = {};
  data.dateCreated = new Date();
  data.objTypeName = _.find(doc.objNameArray, function (item) {
    return mainTypes.indexOf(item) >= 0
  });

  if (doc.person) {
    data.displayName = doc.person.lastName + ', ' + doc.person.firstName + ' ' + doc.person.middleName;
    data.person = {
      jobTitle: doc.person.jobTitle
    }
  } else {
    data.displayName = doc.organization.organizationName;
  }
  var obj = {
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.contactableAdd,
    entityId: doc._id,
    data: data
  };
  if (doc && doc.testData) obj.testData = true;
  Activities.insert(obj)
});

Contactables.after.update(function (userId, doc, fieldNames, modifier, options) {
  var self = this;

  var changes = [];

  // Check person properties
  if (fieldNames.indexOf('person') != -1) {
    var personProperties = [
      {field: 'firstName', displayName: 'first name'},
      {field: 'lastName', displayName: 'last name'},
      {field: 'middleName', displayName: 'middle name'},
      {field: 'jobTitle', displayName: 'job title'},
      {field: 'salutation', displayName: 'salutation'}
    ];

    propertiesTracker(doc, self.previous, changes, 'person', personProperties);
  }

  // Check organization properties
  if (fieldNames.indexOf('organization') != -1) {
    var organizationProperties = [
      {field: 'organizationName', displayName: 'organization name'},
    ];

    propertiesTracker(doc, self.previous, changes, 'organization', organizationProperties);
  }

  // Track changes in Client, Contact and Employee fields
  if (fieldNames.indexOf('Client') != -1) {
    var clientProperties = [
      {field: 'department', displayName: 'department'},
      {
        field: 'status', displayName: 'status', displayValue: function (statusId) {
        var status = LookUps.findOne(statusId);
        return status.displayName;
      }
      },
      {field: 'workerCompCode', displayName: 'Comp code'}
    ];

    propertiesTracker(doc, self.previous, changes, 'Client', clientProperties);
  }

  if (fieldNames.indexOf('Employee') != -1) {
    var employeeProperties = [
      {field: 'taxID', displayName: 'TaxID/SSN'},
      {
        field: 'status', displayName: 'status', displayValue: function (statusId) {
        var status = LookUps.findOne(statusId);
        return status.displayName;
      }
      }
    ];
    if (self.previous['Employee']) //make sure this isn't a transformation to an employee from contact
      propertiesTracker(doc, self.previous, changes, 'Employee', employeeProperties);
  }

  if (fieldNames.indexOf('Contact') != -1) {
    var contactProperties = [
      {
        field: 'client', displayName: 'Client', displayValue: function (clientId) {
        var client = Contactables.findOne(clientId);
        if (client) {
          if (client.person)
            return client.person.lastName + ', ' + client.person.firstName + ' ' + client.person.middleName;
          if (client.organization)
            return client.organization.organizationName;
        }
      }
      },
      {
        field: 'status', displayName: 'Status', displayValue: function (statusId) {
        var status = LookUps.findOne(statusId);
        return status.displayName;
      }
      }
    ];
    if (self.previous['Contact']) //make sure this isn't a transformation to contact from employee
      propertiesTracker(doc, self.previous, changes, 'Contact', contactProperties);
  }

  // Status note
  if (fieldNames.indexOf('statusNote') != -1) {
    var statusNote = [{field: 'statusNote', displayName: 'Status note'}];

    propertiesTracker(doc, self.previous, changes, undefined, statusNote);
  }

  // Location
  if (fieldNames.indexOf('location') != -1) {
    var location = [{
      field: 'location', displayName: 'Address', displayValue: function (location) {
        Utils.getLocationDisplayName(location)
      }
    }];

    propertiesTracker(doc, self.previous, changes, undefined, location);
  }

  var lists = [
    {
      fieldName: 'education', displayName: 'education', displayItem: function (education) {
      return education.description + ' at ' + education.institution;
    }
    },
    {
      fieldName: 'pastJobs', displayName: 'past jobs', displayItem: function (pastJob) {
      return pastJob.position + ' at ' + pastJob.company;
    }
    },
    {fieldName: 'tags', displayName: 'tags'},
    {
      fieldName: 'contactMethods', displayName: 'contact methods', displayItem: function (contactMethod) {
      var type = LookUps.findOne(contactMethod.type);
      return type.displayName + ' ' + contactMethod.value;
    }
    }
  ];

  _.forEach(lists, function (list) {
    if (fieldNames.indexOf(list.fieldName) == -1) return;

    listTracker(doc, self.previous, changes, list);
  });

  _.forEach(changes, function (change) {
    _.extend(change, {dateCreated: new Date()});

    Activities.insert({
      userId: userId,
      hierId: doc.hierId,
      type: Enums.activitiesType.contactableUpdate,
      entityId: doc._id,
      data: change
    })
  });
});

// Note

Notes.after.insert(function (userId, doc) {
  var obj = {
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.noteAdd,
    entityId: doc._id,
    links: _.map(doc.links, function (link) {
      return link.id;
    }),
    data: {
      dateCreated: new Date()
    }
  };
  if (doc && doc.testData) obj.testData = true;
  Activities.insert(obj);
});

// Tasks
Tasks.after.insert(function (userId, doc) {
  var obj = {
    userId: doc.userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.taskAdd,
    entityId: doc._id,
    links: _.map(doc.links, function (link) {
      return link.id;
    }),
    data: {
      taskId: doc._id,
      dateCreated: new Date()
    }
  };
  if (doc && doc.testData) obj.testData = true;
  Activities.insert(obj);
});

// Jobs

Jobs.after.insert(function (userId, doc) {
  var cust = Contactables.findOne(doc.client);
  var clientDisplayName;
  if (cust && cust.organization) clientDisplayName = cust.organization.organizationName;
  var obj = {
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.jobAdd,
    entityId: doc._id,
    links: [doc._id, doc.client],
    data: {
      publicJobTitle: doc.publicJobTitle,
      clientId: doc.client,
      dateCreated: new Date(),
      clientDisplayName: clientDisplayName
    }
  };
  if (doc && doc.testData) obj.testData = true;
  Activities.insert(obj);
});

//Placements

Placements.after.insert(function (userId, doc) {
  var data = {};
  data.dateCreated = new Date();
  data.job = doc.job;
  data.employee = doc.employee;

  var placementStatus = LookUps.findOne(doc.placementStatus);
  var type = Enums.activitiesType.placementAdd;
  console.log(placementStatus);

  if (placementStatus) {
    if (_.contains(placementStatus.lookUpActions, Enums.lookUpAction.Placement_Assigned)) {
      type = Enums.activitiesType.placementAdd;
    } else if (_.contains(placementStatus.lookUpActions, Enums.lookUpAction.Placement_Candidate)) {
      type = Enums.activitiesType.candidateAdd;

    }
  }
  var obj = {
    userId: userId,
    hierId: doc.hierId,
    type: type,
    entityId: doc._id,
    links: [doc._id, doc.job, doc.employee],
    data: data
  };
  if (doc && doc.testData) obj.testData = true;
  Activities.insert(obj)
});

Placements.after.update(function (userId, doc, fieldNames, modifier, options) {
  var self = this;

  var changes = [];

  var lists = [
    {fieldName: 'tags', displayName: 'tags'},
    {
      fieldName: 'placementRates', displayName: 'placement rates', displayItem: function (placementRate) {
      var type = LookUps.findOne(placementRate.type);
      return type.displayName + ': Pay ' + placementRate.pay + ', Bill ' + placementRate.bill;
    }
    }
  ];

  _.forEach(lists, function (list) {
    if (fieldNames.indexOf(list.fieldName) == -1) return;

    listTracker(doc, self.previous, changes, list);
  });

  // Status note
  if (fieldNames.indexOf('statusNote') != -1) {
    var statusNote = [{field: 'statusNote', displayName: 'Status note'}];

    propertiesTracker(doc, self.previous, changes, undefined, statusNote);
  }

  // Placement status
  if (fieldNames.indexOf('candidateStatus') != -1) {
    var candidateStatus = [{
      field: 'candidateStatus', displayName: 'Candidate status', displayValue: function (candidateStatusId) {
        var status = LookUps.findOne(candidateStatusId);
        return status.displayName;
      }
    }];

    propertiesTracker(doc, self.previous, changes, undefined, candidateStatus);
  }

  _.forEach(changes, function (change) {
    _.extend(change, {dateCreated: new Date()});
    var obj = {
      userId: userId,
      hierId: doc.hierId,
      type: Enums.activitiesType.placementEdit,
      entityId: doc._id,
      data: change
    };
    if (doc && doc.testData) obj.testData = true;
    Activities.insert(obj);
  });
});

// Contactable files

ContactablesFiles.after.insert(function (userId, doc) {
  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.fileAdd,
    entityId: doc._id,
    links: [doc.entityId],
    data: {
      dateCreated: new Date()
    }
  });
});


// Users

Meteor.startup(function () {
  Meteor.methods({
    userLoginActivity: function () {
      var data = {};
      data.username = Meteor.user().username;
      data.dateCreated = new Date();
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

Activities._ensureIndex({type: 1});
// Helpers

var propertiesTracker = function (doc, previous, changes, root, properties) {
  _.forEach(properties, function (property) {
    var previousValue = root ? previous[root][property.field] : previous[property.field];
    var newValue = root ? doc[root][property.field] : doc[property.field];
    if (newValue != previousValue)
      changes.push({
        fieldDisplayName: property.displayName,
        oldValue: property.displayValue ? property.displayValue(previousValue) : previousValue,
        newValue: property.displayValue ? property.displayValue(newValue) : newValue
      });
  });
};

var listTracker = function (doc, previous, changes, list) {
  var previousValues = previous[list.fieldName];
  var newValues = doc[list.fieldName];

  if (previousValues && previousValues.length > newValues.length) { // Item removed
    changes.push({fieldDisplayName: list.displayName, removed: true});
  } else if (!previousValues || previousValues.length < newValues.length) { // Item added
    var addedItem = newValues[newValues.length - 1];
    changes.push({
      fieldDisplayName: list.displayName,
      added: true,
      newValue: list.displayItem ? list.displayItem(addedItem) : addedItem
    });
  } else if (previousValues.length == newValues.length) { // Item updated
    _.forEach(previousValues, function (value, index) {
      // Compare old values and new values
      if (!_.isEqual(value, newValues[index])) {
        if (!_.isObject(value)) {
          changes.push({
            fieldDisplayName: list.displayName,
            changed: true,
            oldValue: value,
            newValue: newValues[index]
          });
        } else {
          var properties = _.keys(value);
          var subChanges = [];
          _.forEach(properties, function (property) {
            if (!_.isEqual(value[property], newValues[index][property]))
              subChanges.push({
                property: property,
                newValue: newValues[index][property],
                oldValue: value[property]
              });
          });

          changes.push({fieldDisplayName: list.displayName, changed: true, subChanges: subChanges});
        }
      }
    });
  }
};


Activities._ensureIndex({dateCreated: 1});
Activities._ensureIndex({activeStatus: 1});
Activities._ensureIndex({userId: 1});
Activities._ensureIndex({hierId: 1});
Activities._ensureIndex({entityId: 1});
Activities._ensureIndex({type: 1});
