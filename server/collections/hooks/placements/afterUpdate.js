
Placements.after.update(function (userId, doc) {
  if (doc.employee != this.previous.employee) {
    Contactables.update({_id: this.previous.employee}, {$set: {placement: null}});
    Contactables.update({_id: doc.employee}, {$set: {placement: doc._id}});
  }
});

// add some employee fields for placement sorting
Placements.after.update(function (userId, doc) {
  if (doc.employee != this.previous.employee) {
    var employee = doc.employee && Contactables.findOne(doc.employee);
    if (employee) {
      var employeeInfo = {
        firstName: employee.person.firstName,
        lastName: employee.person.lastName,
        middleName: employee.person.middleName
      };
      Placements.update({_id: doc._id}, {$set: {employeeInfo: employeeInfo}});
    }
  }
});


// Activities - NEEDS REWRITING
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

  _.each(changes, function (change) {
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
Placements.after.update(function (userId, doc, fieldNames, modifier, options) {
  // in case you delete a tag, it wouldn't be deleted from the tag collection
  if (fieldNames.indexOf('tags') != -1) {
    if (doc.tags != null) {
      _.each(doc.tags, function (t) {
        if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
          Tags.insert({tags: t, hierId: doc.hierId});
        }
      });
    }
  }
});


// Placements View
Placements.after.update(function (userId, placement, fieldNames, modifier, options) {
  var update = {$set: {}};

  // Candidate Status
  if (_.contains(fieldNames, 'candidateStatus') && modifier.$set.candidateStatus) {
    update.$set.candidateStatus = modifier.$set.candidateStatus;
  }

  // Active Status
  if (_.contains(fieldNames, 'activeStatus') && modifier.$set.activeStatus) {
    update.$set.activeStatus = modifier.$set.activeStatus;
  }

  // Start Date
  if (_.contains(fieldNames, 'startDate') && modifier.$set.startDate) {
    update.$set.startDate = modifier.$set.startDate;
  }

  // End Date
  if (_.contains(fieldNames, 'endDate') && modifier.$set.endDate) {
    update.$set.endDate = modifier.$set.endDate;
  }

  // Placement Rates
  if (_.contains(fieldNames, 'placementRates') && modifier.$set.placementRates) {
    update.$set.placementRates = modifier.$set.placementRates;
  }

  // Tags
  if (_.contains(fieldNames, 'tags') && modifier.$addToSet && modifier.$addToSet.tags) {
    update.$addToSet = {tags: modifier.$addToSet.tags};
  }
  if (_.contains(fieldNames, 'tags') && modifier.$pull && modifier.$pull.tags) {
    update.$pull = {tags: modifier.$pull.tags};
  }

  // Display Name
  if (_.contains(fieldNames, 'displayName') && modifier.$set.displayName) {
    update.$set.displayName = modifier.$set.displayName;
  }


  // Update placements view
  if (!_.isEmpty(update.$set)) {
    PlacementsView.update({placementId: placement._id}, update);
  }
});


// Notes View
Placements.after.update(function (userId, doc, fields, update) {
  if (update.$set && update.$set['displayName']) {
    NotesView.update({"links.id": doc._id}, {$set: {"links.$.displayName": doc.displayName}}, {multi: true})
  }
});
