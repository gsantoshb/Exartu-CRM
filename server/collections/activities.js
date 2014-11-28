ActivityViews = new View('activities', {
  collection: Activities,
  cursors: function (activity) {

    // Contactables
    this.publish({
      cursor: function (activity) {
        if (activity.type === Enums.activitiesType.contactableAdd) {
          return Contactables.find({ _id: activity.entityId, auxType: { $ne: Enums.activitiesType.contactableAdd } }); // hack to obtain the type in the onChange event
        }
      },
      to: 'contactables',
      observedProperties: ['entityId'],
      onChange: function (changedProps, oldSelector) {
        if (oldSelector.auxType.$ne === Enums.activitiesType.contactableAdd) {
          return Contactables.find({ _id: changedProps, auxType: { $ne: Enums.activitiesType.contactableAdd } }); // hack to obtain the type in the onChange event
        }
      }
    });

    // Tasks
    this.publish({
      cursor: function (activity) {
        if (activity.type === Enums.activitiesType.taskAdd) {
          return Tasks.find({ _id: activity.data.taskId, auxType: { $ne: Enums.activitiesType.taskAdd } }); // hack to obtain the type in the onChange event
        }
      },
      to: 'tasks',
      observedProperties: ['entityId'],
      onChange: function (changedProps, oldSelector) {
        if (oldSelector.auxType.$ne === Enums.activitiesType.taskAdd) {
          return Tasks.find({ _id: changedProps, auxType: { $ne: Enums.activitiesType.taskAdd } }); // hack to obtain the type in the onChange event
        }
      }
    });

    // Jobs
    this.publish({
      cursor: function (activity) {
        if (activity.type === Enums.activitiesType.jobAdd) {
          return Jobs.find({ _id: activity.entityId, auxType: { $ne: Enums.activitiesType.jobAdd } }); // hack to obtain the type in the onChange event
        }
      },
      to: 'jobs',
      observedProperties: ['entityId'],
      onChange: function (changedProps, oldSelector) {
        if (oldSelector.auxType.$ne === Enums.activitiesType.jobAdd) {
          return Jobs.find({ _id: changedProps, auxType: { $ne: Enums.activitiesType.jobAdd } }); // hack to obtain the type in the onChange event
        }
      }
    });

    // Notes
    this.publish({
      cursor: function (activity) {
        if (activity.type === Enums.activitiesType.noteAdd) {
          return Notes.find({ _id: activity.data.noteId});
        }
      },
      to: 'notes'
    });

    // Placements
    this.publish({
      cursor: function (activity) {
        if (activity.type === Enums.activitiesType.placementAdd || activity.type === Enums.activitiesType.placementEdit) {
          return Placements.find({ _id: activity.entityId});
        }
      },
      to: 'notes'
    });
  }
});

Meteor.paginatedPublish(ActivityViews, function () {
  return Utils.filterCollectionByUserHier.call(this, ActivityViews.find({},{ sort: { 'data.dateCreated': -1 } }));
},{
  //infiniteScroll: true,
  pageSize: 15,
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

Contactables.after.update(function (userId, doc, fieldNames, modifier, options) {
  var self = this;

  var changes = [];

  var propertiesTracker = function (root, properties) {
    _.forEach(properties, function (property){
      var previousValue = root ? self.previous[root][property.field] : self.previous[property.field];
      var newValue = root? doc[root][property.field] : doc[property.field];
      if (newValue != previousValue)
        changes.push({
          fieldDisplayName: property.displayName,
          oldValue: property.displayValue ? property.displayValue(previousValue) : previousValue,
          newValue: property.displayValue? property.displayValue(newValue) : newValue
        });
    });
  };

  // Check person properties
  if (fieldNames.indexOf('person') != -1) {
    var personProperties = [
      { field: 'firstName', displayName: 'first name'},
      { field: 'lastName', displayName: 'last name'},
      { field: 'middleName', displayName: 'middle name'},
      { field: 'jobTitle', displayName: 'job title'},
      { field: 'salutation', displayName: 'salutation'}
    ];

    propertiesTracker('person', personProperties);
  }

  // Check organization properties
  if (fieldNames.indexOf('organization') != -1) {
    var organizationProperties = [
      { field: 'organizationName', displayName: 'organization name'},
    ];

    propertiesTracker('organization', organizationProperties);
  }

  // Track changes in Customer, Contact and Employee fields
  console.log('fieldNames', fieldNames)
  if (fieldNames.indexOf('Customer') != -1) {
    var customerProperties = [
      { field: 'department', displayName: 'department'},
      { field: 'status', displayName: 'status', displayValue: function (statusId) {
        var status = LookUps.findOne(statusId);
        console.log('status changed ', status.displayName);
        return status.displayName;
      }},
      { field: 'workerCompCode', displayName: 'Comp code'}
    ];

    propertiesTracker('Customer', customerProperties);
  }

  if (fieldNames.indexOf('Employee') != -1) {
    var employeeProperties = [
      { field: 'taxID', displayName: 'TaxID/SSN'},
      { field: 'status', displayName: 'status', displayValue: function (statusId) {
        var status = LookUps.findOne(statusId);
        return status.displayName;
      }},
    ];

    propertiesTracker('Employee', employeeProperties);
  }

  if (fieldNames.indexOf('Contact') != -1) {
    var contactProperties = [
      { field: 'customer', displayName: 'Customer', displayValue: function (customerId) {
        var customer = Contactables.findOne(customerId);
        if (customer.person)
          return customer.person.lastName + ', ' + customer.person.firstName + ' ' + customer.person.middleName;
        if (customer.organization)
          return customer.organization.organizationName;
      }},
      { field: 'status', displayName: 'Status', displayValue: function (statusId) {
        var status = LookUps.findOne(statusId);
        return status.displayName;
      }}
    ];

    propertiesTracker('Contact', contactProperties);
  }

  // Status note
  if (fieldNames.indexOf('statusNote') != -1) {
    var statusNote = [{field: 'statusNote', displayName: 'Status note'}];

    propertiesTracker(undefined, statusNote);
  }

  // Location
  if (fieldNames.indexOf('location') != -1) {
    var location = [{field: 'location', displayName: 'Address', displayValue: function (location) {
      Utils.getLocationDisplayName(location)
    }}];

    propertiesTracker(undefined, location);
  }

  var lists = [
    { fieldName: 'education', displayName: 'education', displayItem: function (education) {
      return education.description + ' at ' + education.institution;
    }},
    { fieldName: 'pastJobs', displayName: 'past jobs', displayItem: function (pastJob) {
      return pastJob.position + ' at ' + pastJob.company;
    }},
    { fieldName: 'tags', displayName: 'tags'},
    { fieldName: 'contactMethods', displayName: 'contact methods', displayItem: function (contactMethod) {
      var type = LookUps.findOne(contactMethod.type);
      return type.displayName + ' ' + contactMethod.value;
    }}
  ];

  _.forEach(lists, function (list) {
    if (fieldNames.indexOf(list.fieldName) == -1) return;

    var previousValues = self.previous[list.fieldName];
    var newValues = doc[list.fieldName];

    if (previousValues && previousValues.length > newValues.length) { // Item removed
      changes.push({fieldDisplayName: list.displayName, removed: true});
    } else if (!previousValues || previousValues.length < newValues.length) { // Item added
      var addedItem = newValues[newValues.length - 1];
      changes.push({fieldDisplayName: list.displayName, added: true, newValue: list.displayItem ? list.displayItem(addedItem) : addedItem});
    } else if (previousValues.length == newValues.length) { // Item updated
      _.forEach(previousValues, function (value, index) {
        // Compare old values and new values
        if (! _.isEqual(value, newValues[index])) {
          if (! _.isObject(value)) {
            changes.push({fieldDisplayName: list.displayName, changed: true, oldValue: value, newValue: newValues[index]});
          } else {
            var properties = _.keys(value);
            var subChanges = [];
            _.forEach(properties, function (property) {
              if (! _.isEqual(value[property], newValues[index][property]))
                subChanges.push({property: property, newValue: newValues[index][property], oldValue: value[property]});
            });

            changes.push({fieldDisplayName: list.displayName, changed: true, subChanges: subChanges});
          }
        }
      });
    }
  });

  _.forEach(changes, function (change) {
    _.extend(change, { dateCreated: new Date()});

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
  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.noteAdd,
    entityId: doc._id,
    links: _.map(doc.links, function (link) { return link.id; }),
    data: {
      dateCreated: new Date()
    }
  })
});

// Tasks

Tasks.after.insert(function (userId, doc) {
  Activities.insert({
    userId: doc.userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.taskAdd,
    entityId: doc._id,
    links: _.map(doc.links, function (link) { return link.id; }),
    data: {
      taskId: doc._id,
      dateCreated: new Date()
    }
  });
});

// Jobs

Jobs.after.insert(function (userId, doc) {
  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.jobAdd,
    entityId: doc._id,
    links: [doc._id, doc.customer],
    data: {
      publicJobTitle: doc.publicJobTitle,
      customerId: doc.customer,
      dateCreated : new Date()
    }
  });
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
      console.log('placementAdd')
    } else if (_.contains(placementStatus.lookUpActions, Enums.lookUpAction.Placement_Candidate)) {
      type = Enums.activitiesType.candidateAdd;
      console.log('candidateAdd')

    }
  }

  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: type,
    entityId: doc._id,
    links: [doc._id, doc.job, doc.employee],
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
    links: [doc._id, doc.job, doc.employee],
    data: data
  })
});

// Contactable files

ContactablesFiles.after.insert(function (userId, doc) {
  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.fileAdd,
    entityId: doc._id,
    links: [doc._id, doc.entityId],
    data: {
      dateCreated: new Date()
    }
  });
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