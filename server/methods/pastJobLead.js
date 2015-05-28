Meteor.methods({
    'addPastJobLead': function (pastjoblead) {

    try {
      return PastJobLeadManager.addPastJobLead(pastjoblead);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});