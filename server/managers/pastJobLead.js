
PastJobLeadManager = {
  addPastJobLead: function (pastJobLead) {
    var user = Meteor.user();
    var rootHier = Utils.getHierTreeRoot(user.currentHierId);

    // Set hot list properties
    pastJobLead.activeStatus = LookUps.findOne({hierId: rootHier, lookUpCode: Enums.lookUpTypes.active.status.lookUpCode, isDefault: true})._id;

    return PastJobLead.insert(pastJobLead);
  }
};