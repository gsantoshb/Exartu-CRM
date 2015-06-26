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
        contactablesToPublish.push(activity.links[0]);
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

Meteor.paginatedPublish(ActivityViews, function (id) {
  return Utils.filterCollectionByUserHier2(this.userId, ActivityViews.find({$or:[{entityId: id}, {links: id }]}));
},{
  pageSize: 5,
  publicationName: 'entityActivities'
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
