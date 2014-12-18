PlacementManager = {
  // Placements Lookups
  getPlacementStatus: function () {
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    return LookUps.find({ hierId: rootHier, lookUpCode: Enums.lookUpTypes.placement.status.lookUpCode }).fetch();
  },
  getCandidateStatus: function () {
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    return LookUps.find({ hierId: rootHier, lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode }).fetch();
  },

  // Placements
  addPlacement: function (placement) {
    // Validate job
    var job = Jobs.findOne(placement.job);
    if (! job)
      throw new Meteor.Error(404, "Placment's job not found");

    // Validate employee
    var employee = Contactables.findOne({_id: placement.employee, objNameArray: 'Employee'});
    if (! employee)
      throw new Meteor.Error(404, 'Placement employee not found');

    // Validate status
    var status = LookUps.findOne({_id: placement.candidateStatus, lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode});
    if (! status)
      throw new Meteor.Error(404, 'Placement status not found');

    // If placement's job has another placement then keep its rates
    var lastJobPlacement = Placements.findOne({job: placement.job}, {sort: { dateCreated: -1}});
    if (lastJobPlacement)
      placement.placementRates = lastJobPlacement.placementRates;

    return Placements.insert(placement);
  }
};
