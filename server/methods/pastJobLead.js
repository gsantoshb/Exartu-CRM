Meteor.methods({
  //  'addPastJobLead': function (pastjoblead) {
  //
  //  try {
  //    return PastJobLeadManager.addPastJobLead(pastjoblead);
  //  } catch (err) {
  //    throw new Meteor.Error(err.message);
  //  }
  //},
  'setActive': function (id, active){
    PastJobLeadManager.setActive(id, active);
  },
  'setComment': function(id, comment){
    PastJobLeadManager.setComment(id, comment);
  }

});