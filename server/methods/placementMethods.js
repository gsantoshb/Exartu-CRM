Meteor.methods({
  // Placements Lookups
  getPlacementStatus: function () {
    try {
      return PlacementManager.getPlacementStatus();
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  getCandidateStatus: function () {
    try {
      return PlacementManager.getCandidateStatus();
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  getPlacementRateTypes: function () {
    try {
      return PlacementManager.getPlacementRateTypes();
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },

  // Placements
  addPlacement: function (placement) {
    try {
      return PlacementManager.addPlacement(placement);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },

  getPlacements: function(jobId, employeeId) {
    try {
      return PlacementManager.getPlacements(jobId, employeeId);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },

  // Placement Rates
  addPlacementRate: function (rateInfo) {
    try {
      return PlacementManager.addPlacementRate(rateInfo);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  getPlacementRates: function (placementId) {
    try {
      return PlacementManager.getPlacementRates(placementId);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },

  findPlacement: function (query) {
    return Utils.filterCollectionByUserHier.call({ userId: Meteor.userId() }, Placements.find({
      'displayName': {
        $regex: query,
        $options: 'i'
      }
    }, { fields: { 'displayName': 1 } })).fetch();
  },
  addPlacementForAllInQuery: function (jobId,selector) {

    var user = Meteor.user();
    var currentHierId = user.currentHierId;

    var employees = ContactablesView.find(selector).fetch();
    var status = LookUps.findOne({
      lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode,
      isDefault: true,
      hierId: currentHierId
    });
    var lookUpActive = LookUps.findOne({
      lookUpCode: Enums.lookUpCodes.active_status,
      lookUpActions: Enums.lookUpAction.Implies_Active,
      hierId: currentHierId
    });

    var info = [];
    _.forEach(employees, function (employee) {
      var placement = {};
      placement.job = jobId;
      placement.employee = employee._id;
      placement.candidateStatus = status._id;
      placement.objNameArray = ["placement"];

      if (employee.activeStatus === lookUpActive._id) {
        //try {
          console.log('placement', placement);
          PlacementManager.addPlacement(placement);
          console.log('after');
          info.push({placementId: placement, employeeDisplayName: employee.displayName});
        //} catch (e){
        //  console.log(e);
        //}
      }
    });
    return info;
  },
  getPlacementPreview: function(placementId){
    return PlacementManager.getPlacementPreview(placementId);
  },
  isPlacedEmployee: function(employeeId){
    return PlacementManager.isPlacedEmployee(employeeId);
  }
});