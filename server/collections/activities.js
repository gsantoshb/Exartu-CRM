ActivityViews = new View('activities', {
  collection: Activities,
  cursors: function (activity) {
    var self = this;

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
    if (activity.type === Enums.activitiesType.noteAdd) {
      var c = Notes.find({_id: activity.entityId});

      // Publish links
      var note = c.fetch()[0];

      if (note) {
        _.forEach(note.links, function (link) {
          switch (link.type) {
            case Enums.linkTypes.contactable.value:
              self.publish({
                cursor: function () {
                  return Contactables.find(link.id);
                },
                to: 'contactables'
              });
              break;
            case Enums.linkTypes.job.value:
              self.publish({
                cursor: function () {
                  return Jobs.find(link.id);
                },
                to: 'jobs'
              });
              break;
            case Enums.linkTypes.placement.value:
              self.publish({
                cursor: function () {
                  return Placements.find(link.id);
                },
                to: 'placements'
              });
              break;
          }
        });
      }
    }
    this.publish({
      cursor: function (activity) {
        return c;
      },
      to: 'notes'
    });

    // Placements
    if (activity.type === Enums.activitiesType.placementAdd || activity.type === Enums.activitiesType.placementEdit) {
      var placementCursor = Placements.find(activity.entityId);
      var placement = placementCursor.fetch()[0];
      var jobCursor = Jobs.find(placement.job);
      var job = jobCursor.fetch()[0];
      var customerCursor = Contactables.find(job.customer);
      var employeeCursor = Contactables.find(placement.employee);

      this.publish({
        cursor: function () {
          return placementCursor;
        },
        to: 'placements'
      });

      this.publish({
        cursor: function () {
          return jobCursor;
        },
        to: 'jobs'
      });

      this.publish({
        cursor: function () {
          return customerCursor;
        },
        to: 'contactables'
      });

      this.publish({
        cursor: function () {
          return employeeCursor;
        },
        to: 'contactables'
      });
    }
  }
});

Meteor.paginatedPublish(ActivityViews, function () {
  return Utils.filterCollectionByUserHier.call(this, ActivityViews.find({},{ sort: { 'data.dateCreated': -1 } }));
},{
  //infiniteScroll: true,
  pageSize: 50,
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

  // Check person properties
  if (fieldNames.indexOf('person') != -1) {
    var personProperties = [
      { field: 'firstName', displayName: 'first name'},
      { field: 'lastName', displayName: 'last name'},
      { field: 'middleName', displayName: 'middle name'},
      { field: 'jobTitle', displayName: 'job title'},
      { field: 'salutation', displayName: 'salutation'}
    ];

    propertiesTracker(doc, self.previous, changes, 'person', personProperties);
  }

  // Check organization properties
  if (fieldNames.indexOf('organization') != -1) {
    var organizationProperties = [
      { field: 'organizationName', displayName: 'organization name'},
    ];

    propertiesTracker(doc, self.previous, changes, 'organization', organizationProperties);
  }

  // Track changes in Customer, Contact and Employee fields
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

    propertiesTracker(doc, self.previous, changes, 'Customer', customerProperties);
  }

  if (fieldNames.indexOf('Employee') != -1) {
    var employeeProperties = [
      { field: 'taxID', displayName: 'TaxID/SSN'},
      { field: 'status', displayName: 'status', displayValue: function (statusId) {
        var status = LookUps.findOne(statusId);
        return status.displayName;
      }}
    ];

    propertiesTracker(doc, self.previous, changes, 'Employee', employeeProperties);
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

    propertiesTracker(doc, self.previous, changes, 'Contact', contactProperties);
  }

  // Status note
  if (fieldNames.indexOf('statusNote') != -1) {
    var statusNote = [{field: 'statusNote', displayName: 'Status note'}];

    propertiesTracker(doc, self.previous, changes, undefined, statusNote);
  }

  // Location
  if (fieldNames.indexOf('location') != -1) {
    var location = [{field: 'location', displayName: 'Address', displayValue: function (location) {
      Utils.getLocationDisplayName(location)
    }}];

    propertiesTracker(doc, self.previous, changes, undefined, location);
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

    listTracker(doc, self.previous, changes, list);
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
  var cust=Contactables.findOne(doc.customer);
  var customerDisplayName;
  if (cust && cust.organization) customerDisplayName=cust.organization.organizationName;
  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.jobAdd,
    entityId: doc._id,
    links: [doc._id, doc.customer],
    data: {
      publicJobTitle: doc.publicJobTitle,
      customerId: doc.customer,
      dateCreated : new Date(),
      customerDisplayName: customerDisplayName
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

Placements.after.update(function (userId, doc, fieldNames, modifier, options) {
  var self = this;

  var changes = [];

  var lists = [
    { fieldName: 'tags', displayName: 'tags'},
    { fieldName: 'placementRates', displayName: 'placement rates', displayItem: function (placementRate) {
      var type = LookUps.findOne(placementRate.type);
      return type.displayName + ': Pay ' + placementRate.pay + ', Bill ' + placementRate.bill;
    }}
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
    var candidateStatus = [{field: 'candidateStatus', displayName: 'Candidate status', displayValue: function (candidateStatusId) {
      var status = LookUps.findOne(candidateStatusId);
      return status.displayName;
    }}];

    propertiesTracker(doc, self.previous, changes, undefined, candidateStatus);
  }

  _.forEach(changes, function (change) {
    _.extend(change, { dateCreated: new Date()});

    Activities.insert({
      userId: userId,
      hierId: doc.hierId,
      type: Enums.activitiesType.placementEdit,
      entityId: doc._id,
      data: change
    })
  });
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

// Helpers

var propertiesTracker = function (doc, previous, changes, root, properties) {
  _.forEach(properties, function (property){
    var previousValue = root ? previous[root][property.field] : previous[property.field];
    var newValue = root? doc[root][property.field] : doc[property.field];
    if (newValue != previousValue)
      changes.push({
        fieldDisplayName: property.displayName,
        oldValue: property.displayValue ? property.displayValue(previousValue) : previousValue,
        newValue: property.displayValue? property.displayValue(newValue) : newValue
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
};