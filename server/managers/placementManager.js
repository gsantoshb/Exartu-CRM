PlacementManager = {
  // Placements Lookups
  getPlacementStatus: function () {
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    return LookUps.find({hierId: rootHier, lookUpCode: Enums.lookUpTypes.placement.status.lookUpCode}).fetch();
  },
  getCandidateStatus: function () {
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    return LookUps.find({hierId: rootHier, lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode}).fetch();
  },
  getPlacementRateTypes: function () {
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    return LookUps.find({hierId: rootHier, lookUpCode: Enums.lookUpTypes.placement.rate.lookUpCode}).fetch();
  },

  // Placements
  addPlacement: function (placement) {
    // Validate job
    var job = Jobs.findOne(placement.job);
    if (!job)
      throw new Meteor.Error(404, "Placment's job not found");

    // Validate employee
    var employee = Contactables.findOne({_id: placement.employee, objNameArray: 'Employee'});
    if (!employee)
      throw new Meteor.Error(404, 'Placement employee not found');

    // Validate status
    var status = LookUps.findOne({
      _id: placement.candidateStatus,
      lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode
    });
    if (!status)
      throw new Meteor.Error(404, 'Placement status not found');
    // If placement's job has another placement then keep its rates
    var lastJobPlacement = Placements.findOne({job: placement.job}, {sort: {dateCreated: -1}});
    if (lastJobPlacement)
      placement.placementRates = lastJobPlacement.placementRates;
    return Placements.insert(placement);
  },
  getPlacements: function (jobId, employeeId) {
    if (!jobId && !employeeId)
      throw new Error('Either job ID or employee ID must be provided');

    var selector = {};
    if (jobId)
      selector.job = jobId;
    if (employeeId)
      selector.employee = employeeId;

    return Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Placements.find(selector, {sort: {'dateCreated': -1}})).fetch();
  },

  // Placement Rates
  addPlacementRate: function (rateInfo) {
    // Validation
    if (!rateInfo.placementId) { throw new Error('Placement ID is required'); }
    if (!rateInfo.type) { throw new Error('Rate type ID is required'); }
    if (!rateInfo.bill) { throw new Error('Bill amount is required'); }
    if (!rateInfo.pay) { throw new Error('Pay amount is required'); }

    var placement = Placements.findOne({ _id: rateInfo.placementId });
    if (!placement)
      throw new Error('Placement not found for the specified ID');

    // Rate insertion
    Placements.update({_id: rateInfo.placementId}, {
      $push: {
        placementRates: {
          type: rateInfo.type, bill: rateInfo.bill, pay: rateInfo.pay
        }
      }
    }, function (err, result) {
      if (err) { throw err; }
      return result;
    });
  },
  getPlacementRates: function (placementId) {
    if (!placementId)
      throw new Error('Placement ID must be provided');

    var placement = Placements.findOne({ _id: placementId });
    if (!placement)
      throw new Error('Placement not found for the specified ID');

    return placement.placementRates;
  },
  getPlacementPreview: function(placementId){
    console.log(placementId);
    var placement = Placements.findOne({_id:placementId});
    console.log(placement);
    var job = Jobs.findOne({_id:placement.job});
    var contactable = Contactables.findOne({_id:placement.employee});
    return({_id: placement._id, displayName: placement.displayName, links: [
      {_id: contactable._id, type: Enums.linkTypes.contactable.value, displayName:contactable.displayName, contactMethods: contactable.contactMethods},
      {_id: job._id, type: Enums.linkTypes.job.value, displayName:job.displayName}
    ]});
  },
  isPlacedEmployee: function(employeeId){
    var p = Placements.findOne({employee: employeeId});
    if(p){
      return true;
    }
    else{
      return false;
    }
  }
};
