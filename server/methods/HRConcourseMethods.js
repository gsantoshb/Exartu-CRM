Meteor.methods({
  // Client hrc account
  createHrcAccount: function (clientId, email) {
    // Validate parameters
    check(clientId, String);
    check(email, Match.Where(function (addr) {
      return SimpleSchema.RegEx.Email.test(addr);
    }));

    try {
      return HRConcourseManager.createClientAccount(clientId, email);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },

  sendInvitation: function(employeeId, email){
      HRConcourseManager.sendInvitation(employeeId, email);
  },
  createContactableFromUser: function(userId) {
    return HRConcourseManager.createContactableFromUser(userId);
  },

  syncKioskEmployee: function (hierId, docCenterId) {
    return HRConcourseManager.syncKioskEmployee(hierId, docCenterId);
  }
});
