
PastJobLeadManager = {
  //addPastJobLead: function (pastJobLead) {
  //  var user = Meteor.user();
  //  var rootHier = Utils.getHierTreeRoot(user.currentHierId);
  //
  //  // Set hot list properties
  //  pastJobLead.activeStatus = LookUps.findOne({hierId: rootHier, lookUpCode: Enums.lookUpTypes.active.status.lookUpCode, isDefault: true})._id;
  //
  //  return PastJobLead.insert(pastJobLead);
  //}
  setActive: function(id, active){
    PastJobLeads.update({_id:id},{$set:{active:active}});
  },
  setComment: function(id, comment){
    PastJobLeads.update({_id:id},{$set:{comment:comment}});
  }
};