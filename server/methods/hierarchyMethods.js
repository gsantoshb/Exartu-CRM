Meteor.methods({
  createHier: function (hier) {
    return HierarchyManager.create(hier);
  },
  getHierUsers: function () {
    return HierarchyManager.getCurrentHierUsers();
  },
  createHierarchyNumber: function (hierId) {
    // Validate hierId
    var hier = Hierarchies.findOne({_id: hierId});
    if (! hier)
      throw new Meteor.Error(404, 'Hierarchy not found');

    var userHierarchies = Utils.getUserHiers();
    if (! _.findWhere(userHierarchies, {_id: hierId}))
      throw new Meteor.Error(500, 'User not allowed to require number for this hierarchy');

    return SMSManager.createHierarchyNumber(hierId);
  },
  changeCurrentHierId: function(hierId){
    HierarchyManager.changeCurrentHier(hierId);
  },
  setLookUpDefault: function(lookUpCode, valueId) {
    HierarchyManager.setLookupDefault(lookUpCode, valueId);
  },
  saveConfiguration: function(options){
    HierarchyManager.saveConfiguration(options);
  }
});