
PlacementsView = new Mongo.Collection("placementsView");

Meteor.paginatedPublish(PlacementsView, function () {
  if (!this.userId) return [];

  return Utils.filterCollectionByUserHier.call(this, PlacementsView.find({}, {sort: {dateCreated: -1}}));
}, {
  pageSize: 20,
  publicationName: 'placementsView'
});



// Hooks
Placements.after.insert(function (userId, placement) {
  PlacementsView.insert({
    placementId: placement._id,
    hierId: placement.hierId,
    employeeId: placement.employee,
    employeeDisplayName: placement.employeeDisplayName,
    jobId: placement.job,
    jobDisplayName: placement.jobDisplayName,
    candidateStatus: placement.candidateStatus,
    activeStatus: placement.activeStatus,
    userId: placement.userId,
    startDate: placement.startDate,
    endDate: placement.endDate,
    dateCreated: placement.dateCreated,
    placementRates: placement.placementRates,
    tags: placement.tags,
    displayName: placement.displayName
  });
});

Placements.after.update(function (userId, placement, fieldNames, modifier, options) {
  var update = { $set: {} };

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
  if (_.contains(fieldNames,'tags') && modifier.$addToSet && modifier.$addToSet.tags) {
    update.$addToSet = {tags: modifier.$addToSet.tags};
  }
  if (_.contains(fieldNames,'tags') && modifier.$pull && modifier.$pull.tags) {
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

Jobs.after.update(function (userId, job, fieldNames, modifier, options) {
  PlacementsView.update({jobId: job._id}, {
    $set: {
      jobDisplayName: job.publicJobTitle
    }
  }, {multi: true});
});



// Indexes
PlacementsView._ensureIndex({placementId: 1});
PlacementsView._ensureIndex({hierId: 1});
PlacementsView._ensureIndex({userId: 1});
PlacementsView._ensureIndex({employeeId: 1});
PlacementsView._ensureIndex({jobId: 1});
PlacementsView._ensureIndex({dateCreated: 1});
