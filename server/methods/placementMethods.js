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
  }
});