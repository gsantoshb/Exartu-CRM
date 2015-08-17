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

    return TwilioManager.createHierarchyNumber(hierId);
  },
  changeCurrentHierId: function(hierid,userid){
    HierarchyManager.changeCurrentHier(hierid,userid);
  },
  setLookUpDefault: function(lookUpCode, valueId) {
    HierarchyManager.setLookupDefault(lookUpCode, valueId);
  },
  saveConfiguration: function(options){
    HierarchyManager.saveConfiguration(options);
  },
  isWebNameAvailable: function (webName) {
    return HierarchyManager.isWebNameAvailable(webName);
  },
  setCurrentHierarchyMailConf: function(mail, password, host, port){
    HierarchyManager.setCurrentHierarchyMailConf(mail, password, host, port);
  },
  setTwEnterpriseAccount: function (accountInfo) {
    // Validate parameters
    check(accountInfo, {
      username: String,
      password: String
    });

    try {
      return HierarchyManager.setTwEnterpriseAccount(Meteor.user().currentHierId, accountInfo);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },
  syncTwEnterpriseEmployees: function () {
    try {
      return HierarchyManager.syncTwEnterpriseEmployees(Meteor.user().currentHierId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },
  syncTwContactablesIntoAida: function () {
    try {
      return HierarchyManager.syncTwContactablesIntoAida(Meteor.userId(), Meteor.user().currentHierId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});