
// Activities - NEEDS REWRITING
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
      {field: 'organizationName', displayName: 'organization name'}
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
    var contactProperties = [{
      field: 'client', displayName: 'Client', displayValue: function (clientId) {
        var client = Contactables.findOne(clientId);
        if (client) {
          if (client.person)
            return client.person.lastName + ', ' + client.person.firstName + ' ' + client.person.middleName;
          if (client.organization)
            return client.organization.organizationName;
        }
      }
    }, {
      field: 'status', displayName: 'Status', displayValue: function (statusId) {
        var status = LookUps.findOne(statusId);
        return status.displayName;
      }
    }];
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
    }, {
      fieldName: 'pastJobs', displayName: 'past jobs', displayItem: function (pastJob) {
        return pastJob.position + ' at ' + pastJob.company;
      }
    }, {
      fieldName: 'tags', displayName: 'tags'
    }, {
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

// Helper Functions - NEEDS REWRITING
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



// Tags
Contactables.after.update(function (userId, doc, fieldNames, modifier, options) {
  // in case you delete a tag, it wouldn't be deleted from the tag collection
  if (fieldNames.indexOf('tags') != -1) {
    if (doc.tags != null) {
      _.forEach(doc.tags, function (t) {
        if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
          Tags.insert({tags: t, hierId: doc.hierId});
        }
      })
    }
  }
});


// Contactables View
Contactables.after.update(function (userId, contactable, fieldNames, modifier, options) {
  var update = {};
  var viewSet = {};

  _.each(_.intersection(fieldNames, ['userId', 'activeStatus']), function (key) {
    viewSet[key] = contactable[key];
  });
  if (modifier.$set) {
    var setModifier = modifier.$set;

    // display name
    if (setModifier['person.lastName'] || setModifier['person.firstName'] || setModifier['person.middleName']) {
      viewSet.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + (contactable.person.middleName ? (' ' + contactable.person.middleName) : '');
    } else if (setModifier['organization.organizationName']) {
      viewSet.displayName = contactable.organization.organizationName;

      // update contacts
      ContactablesView.update({client: contactable._id}, {$set: {clientName: viewSet.displayName}}, {multi: true});
    }

    // contacts
    if (_.contains(fieldNames, 'Contact')) {
      if (setModifier['Contact.client']) {
        viewSet.client = contactable.Contact.client;
        var client = Contactables.findOne(contactable.Contact.client, {fields: {'organization.organizationName': 1}});
        viewSet.clientName = client.organization.organizationName;
      }
      if (setModifier['Contact.status']) {
        viewSet.contactStatus = contactable.Contact.status;
      }
    }

    // clients
    if (_.contains(fieldNames, 'Client')) {
      if (setModifier['Client.status']) {
        viewSet.clientStatus = contactable.Client.status;
      }
      if (setModifier['Client.department']) {
        viewSet.department = contactable.Client.department;
      }
    }

    // employees
    if (_.contains(fieldNames, 'Employee')) {
      if (setModifier['Employee.status']) {
        viewSet.employeeStatus = contactable.Employee.status;
      }
      if (setModifier['Employee.taxID']) {
        viewSet.taxID = contactable.Employee.taxID;
      }
    }
  }

  // placement
  if (_.contains(fieldNames, 'placement')) {
    var placement = Placements.findOne(contactable.placement, {fields: {'candidateStatus': 1, job: 1}});
    var job = Jobs.findOne(placement.job, {fields: {'publicJobTitle': 1, 'clientDisplayName': 1, 'client': 1}});
    viewSet.placement = _.pick(placement, 'candidateStatus');
    viewSet.placement.jobDisplayName = job.publicJobTitle;
    viewSet.placement.clientDisplayName = job.clientDisplayName;
    viewSet.placement.job = job._id;
    viewSet.placement.client = job.client;
  }

  // tags
  if (_.contains(fieldNames, 'tags')) {
    if (modifier.$addToSet) {
      update.$addToSet = modifier.$addToSet;
    } else if (modifier.$pull) {
      update.$pull = modifier.$pull;
    }
  }

  // contactMethods
  if (_.contains(fieldNames, 'contactMethods')) {
    if (modifier.$addToSet) {
      update.$addToSet = modifier.$addToSet;
    } else if (modifier.$pull) {
      update.$pull = modifier.$pull;
    }
  }
  if (!_.isEmpty(viewSet)) {
    update.$set = viewSet;
  }

  if (!_.isEmpty(update)) {
    ContactablesView.update({_id: contactable._id}, update);
  }
});


// Jobs View
Contactables.after.update(function (userId, contactable, fieldNames, modifier, options) {
  JobsView.update({clientId: contactable._id}, {
    $set: {
      clientDisplayName: contactable.displayName,
      clientDepartmentName: contactable.Client ? contactable.Client.department : ''
    }
  }, {multi: true});
});


// Notes View
Contactables.after.update(function (userId, doc, fields, update) {
  if (doc.person) {
    if (update.$set && (update.$set['person.lastName'] || update.$set['person.middleName'] || update.$set['person.lastName'])) {
      NotesView.update({"links.id": doc._id}, {$set: {"links.$.displayName": doc.person.lastName + ", " + doc.person.firstName + " " + doc.person.middleName}}, {multi: true})
    }
  }
  else if (doc.organization) {
    console.log(update.$set);
    if (update.$set && (update.$set['organization.organizationName'])) {
      NotesView.update({"links.id": doc._id}, {$set: {"links.$.displayName": doc.organization.organizationName}}, {multi: true})
    }
  }
});


// Past Job Leads View
Contactables.after.update(function (userId, doc, fields, update) {
  if (_.contains(fields, "pastJobs")) {
    if (update.$addToSet) {
      var newPastJob = update.$addToSet.pastJobs;
      _.extend(newPastJob, {comment: "", active: true});
      _.extend(newPastJob, {_id: newPastJob.id});
      _.extend(newPastJob, {hierId: Meteor.user().currentHierId});
      _.extend(newPastJob, {employeeId: doc._id, employeeName: doc.displayName});
      newPastJob = _.omit(newPastJob, 'id');
      PastJobLeads.insert(newPastJob);
    } else if (update.$pull) {
      PastJobLeads.remove({_id: update.$pull.pastJobs.id})
    } else if (update.$set['pastJobs.$']) {
      var newPastJob = update.$set['pastJobs.$'];
      _.extend(newPastJob, {comment: "", active: true});
      _.extend(newPastJob, {_id: newPastJob.id});
      _.extend(newPastJob, {hierId: Meteor.user().currentHierId});
      _.extend(newPastJob, {employeeId: doc._id, employeeName: doc.displayName});
      newPastJob = _.omit(newPastJob, 'id');
      PastJobLeads.update({_id: update.$set['pastJobs.$'].id}, newPastJob);
    }
  }
});


// Placements View
Contactables.after.update(function (userId, contactable, fieldNames, modifier, options) {
  PlacementsView.update({employeeId: contactable._id}, {
    $set: {
      employeeDisplayName: contactable.person ? contactable.person.lastName + ', ' + contactable.person.firstName : ''
    }
  }, {multi: true});
});


// TW Enterprise sync
Contactables.after.update(function (userId, doc, fieldNames, modifier, options) {
  // Sync only when an account has been set up for the document hier and the document has been sync
  if (doc.externalId) {
    var hier = Hierarchies.findOne(doc.hierId);
    if (hier && hier.enterpriseAccount) {
      // Set up account info for the helper
      var accountInfo = {
        hierId: hier._id,
        username: hier.enterpriseAccount.username,
        password: hier.enterpriseAccount.password,
        accessToken: hier.enterpriseAccount.accessToken,
        tokenType: hier.enterpriseAccount.tokenType
      };

      var data = {};

      // Update Employee
      if (doc.Employee) {
        // Check if person fields were modified
        if (fieldNames.indexOf('person') != -1) {
          if (this.previous.person.firstName != doc.person.firstName)
            data.firstName = doc.person.firstName;
          if (this.previous.person.lastName != doc.person.lastName)
            data.lastName = doc.person.lastName;
        }

        // Check if Employee fields were modified
        if (fieldNames.indexOf('Employee') != -1) {
          if (this.previous.Employee.taxID != doc.Employee.taxID)
            data.ssn = doc.Employee.taxID.replace(/-/g,'');
        }

        // Check if contact methods were modified
        if (fieldNames.indexOf('contactMethods') != -1) {
          var hierFilter = Utils.filterByHiers(doc.hierId);

          // Email contact method
          var emailCM = LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            lookUpActions: Enums.lookUpAction.ContactMethod_Email,
            $or: hierFilter
          });
          var email = _.find(doc.contactMethods, function (cm) { return cm.type == emailCM._id; });
          if (email) data.email = email;

          // Phone contact method
          var phoneCM = LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            lookUpActions: Enums.lookUpAction.ContactMethod_Phone,
            $or: hierFilter
          });
          var phone = _.find(doc.contactMethods, function (cm) { return cm.type == phoneCM._id; });
          if (phone) data.phone = phone;
        }

        if (!_.isEmpty(data)) TwApi.updateEmployee(doc.externalId, data, accountInfo);
      }
    }
  }
});
// Delayed TW Enterprise Insertion/Update
Contactables.after.update(function (userId, doc, fieldNames, modifier, options) {
  // Check if the update is triggered by an Enterprise insert synchronization
  if (fieldNames.indexOf('externalId') != -1) {
    var hier = Hierarchies.findOne(doc.hierId);
    if (hier && hier.enterpriseAccount) {
      // Set up account info for the helper
      var accountInfo = {
        hierId: hier._id,
        username: hier.enterpriseAccount.username,
        password: hier.enterpriseAccount.password,
        accessToken: hier.enterpriseAccount.accessToken,
        tokenType: hier.enterpriseAccount.tokenType
      };

      var data = {};

      // Update Employee
      if (doc.Employee) {
        if (doc.person.firstName) data.firstName = doc.person.firstName;
        if (doc.person.lastName) data.lastName = doc.person.lastName;
        if (doc.Employee.taxID) data.ssn = doc.Employee.taxID.replace(/-/g,'');
        if (doc.contactMethods && doc.contactMethods.length > 0) {
          var hierFilter = Utils.filterByHiers(doc.hierId);

          // Email contact method
          var emailCM = LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            lookUpActions: Enums.lookUpAction.ContactMethod_Email,
            $or: hierFilter
          });
          var email = _.find(doc.contactMethods, function (cm) { return cm.type == emailCM._id; });
          if (email) data.email = email;

          // Phone contact method
          var phoneCM = LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            lookUpActions: Enums.lookUpAction.ContactMethod_Phone,
            $or: hierFilter
          });
          var phone = _.find(doc.contactMethods, function (cm) { return cm.type == phoneCM._id; });
          if (phone) data.phone = phone;
        }

        // Update enterprise
        if (!_.isEmpty(data)) TwApi.updateEmployee(doc.externalId, data, accountInfo);
      }
    }
  }
});
