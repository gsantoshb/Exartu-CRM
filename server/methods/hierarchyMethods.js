Meteor.methods({
  createHier: function (hier) {
    return HierarchyManager.create(hier);
  },
  getHierUsers: function () {
    return HierarchyManager.getCurrentHierUsers();
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