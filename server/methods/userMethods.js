Meteor.methods({
  getUserInformation: function (userId) {
    return UserManager.getUserInformation(userId);
  },
  checkUniqueness: function (query) {
    return UserManager.checkUniqueness(query);
  },
  updateUserPicture: function (fileId) {
    UserManager.updateUserPicture(fileId);
  },
  resendEmailVerification: function(email) {
    UserManager.resendEmailVerification(email);
  },
  updateEmailVerification: function(email) {
    UserManager.updateEmailVerification(email);
  },
  setLastCustomerUsed: function(id){
    UserManager.setLastCustomerUsed(id);
  },
  isUsernameAvailable: function (username) {
    return UserManager.isUsernameAvailable(userName);
  },
  isEmailAvailable: function (email) {
    return UserManager.isEmailAvailable(email);
  },
  registerAccount: function (document, skipEmailVerification) {
    return EmailManager.registerAccount(document, skipEmailVerification);
  },
  sendUserInvitation: function (user, hierId) {
    EmailManager.sendUserInvitation(user, hierId);
  },
  resendUserInvitation: function(userInvitationId) {
    EmailManager.resendUserInvitation(userInvitationId);
  },
  registerAccountFromInvitation: function(token, user) {
    EmailManager.registerAccountFromInvitation(token, user);
  }
});