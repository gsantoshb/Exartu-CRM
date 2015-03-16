Meteor.methods({
  sendInvitation: function(employeeId, email){
      HRConcourseManager.sendInvitation(employeeId, email);
  },
  createContactableFromUser: function(userId) {
    return HRConcourseManager.createContactableFromUser(userId);
  }
});
