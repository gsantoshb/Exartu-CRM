Meteor.methods({
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
