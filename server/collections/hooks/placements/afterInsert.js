
Placements.after.insert(function (userId, doc) {
  Contactables.update({_id: doc.employee}, {$set: {placement: doc._id}});
  Jobs.update({_id: doc.job}, {$set: {placement: doc._id}});
});


// Activities
Placements.after.insert(function (userId, doc) {
  var data = {};
  data.dateCreated = new Date();
  data.job = doc.job;
  data.employee = doc.employee;

  var placementStatus = LookUps.findOne(doc.placementStatus);
  var type = Enums.activitiesType.placementAdd;

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


// Tags
Placements.after.insert(function (userId, doc) {
  if (doc.tags != null) {
    _.each(doc.tags, function (t) {
      if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
        Tags.insert({tags: t, hierId: doc.hierId});
      }
    });
  }
});


// Placements View
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
