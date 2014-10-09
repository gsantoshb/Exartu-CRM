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
    return UserManager.registerAccount(document, skipEmailVerification);
  },
  sendUserInvitation: function (user, hierId) {
    UserManager.sendUserInvitation(user, hierId);
  },
  resendUserInvitation: function(userInvitationId) {
    UserManager.resendUserInvitation(userInvitationId);
  },
  registerAccountFromInvitation: function(token, user) {
    UserManager.registerAccountFromInvitation(token, user);
  }
});