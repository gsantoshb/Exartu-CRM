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
  setLastClientUsed: function(id){
    UserManager.setLastClientUsed(id);
  },
  isUsernameAvailable: function (userName) {
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
  },
  acceptUserInvitation: function(token) {
    UserManager.acceptUserInvitation(token, Meteor.user());
  },
  addUserToHierarchy: function(id,hierId)
  {
    UserManager.addUserToHierarchy(id,hierId);
  },
    removeUserFromHierarchy: function(id,hierId)
    {
        UserManager.removeUserFromHierarchy(id,hierId);
    },

  // Last used
  getLastUsed: function (type) {
    return UserManager.getLastUsed(type);
  },
  setLastUsed: function (type, value) {
    return UserManager.setLastUsed(type, value);
  },
  bUserIsSystemAdmin: function(user){
    if (!user) user=  Meteor.users.findOne(this.userId);
    return RoleManager.bUserIsSystemAdmin(user);
  },
  bUserIsClientAdmin: function(user){
    if (!user) user=  Meteor.users.findOne(this.userId);
    return RoleManager.bUserIsClientAdmin(user);
  },

  //tours
  setVisitedTour: function(tour, tip){
    UserManager.setVisitedTour(tour, tip);
  },
  getIndexTour: function(tour){
    return UserManager.getIndexTour(tour);
  }

});