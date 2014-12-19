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

  // Placements
  addPlacement: function (placement) {
    return PlacementManager.addPlacement(placement);
  },

  getPlacements: function(jobId, employeeId) {
    try {
      return PlacementManager.getPlacements(jobId, employeeId);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
});