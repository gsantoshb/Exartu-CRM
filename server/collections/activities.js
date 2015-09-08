
var activityViewsHandler = function (activity) {
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

};
ActivityViews = new View('activities', {
  collection: Activities,
  cursors: activityViewsHandler
});
IncomingCallActivityViews = new View('incomingCallActivities', {
  collection: Activities,
  cursors: activityViewsHandler
});

Meteor.paginatedPublish(ActivityViews, function () {
    return Utils.filterCollectionByUserHier.call(this, ActivityViews.find({}, {sort: {'data.dateCreated': -1}}));
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
        newSelector.entityId = {$in: ids};
      }

      var activityTypes = newSelector.type.$in;
      newSelector.type.$in = [];
      _.each(activityTypes, function (activityType) {
        newSelector.type.$in.push(parseInt(activityType));
      });

      return newSelector;
    }
  }
);

Meteor.publish('getActivities', function (query, options) {
  //console.log(options);
  //console.log(query);
  var searchQuery = {};

  var types = [];
  _.each(query.type.$in, function (type) {
    types.push(parseInt(type));
  });

  searchQuery = {type: {$in: types}};

  if (query && query.searchString) {
    var userHier = Utils.getUserHierId(this.userId);
    var ids = ActivityManager.searchActivities(query.searchString, userHier);
    searchQuery = {
      $and: [
        {type: {$in: types}},
        {entityId: {$in: ids}}
      ]
    }
  }

  var activitiesCursor = ActivityViews.find(searchQuery, options);
  if (options.limit > activitiesCursor.count()) {
    options.limit = 0;
  }

  var activities = Utils.filterCollectionByUserHier.call(this, activitiesCursor);
  return activities;
});

Meteor.paginatedPublish(ActivityViews, function (id) {
  return Utils.filterCollectionByUserHier2(this.userId, ActivityViews.find({$or: [{entityId: id}, {links: id}]}, {sort: {'dateCreated': -1}}));
}, {
  pageSize: 5,
  publicationName: 'entityActivities'
});

Meteor.paginatedPublish(IncomingCallActivityViews, function (id) {
  return Utils.filterCollectionByUserHier2(this.userId, IncomingCallActivityViews.find({$or: [{entityId: id}, {links: id}]}, {sort: {'dateCreated': -1}}));
}, {
  pageSize: 5,
  publicationName: 'incomingCall'
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
