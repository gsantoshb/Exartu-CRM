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
  updateUserInfo: function (userInfo) {
    UserManager.updateUserInfo(userInfo);
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
  isEmailAvailable: function (email, options) {
    return UserManager.isEmailAvailable(email, options);
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
  },

  //roles
  /**
   * Adds the roleId to the userId in the logged user's currentHierId
   * @param userId
   * @param roleId
   */

  addRoleToUser: function (userId, roleId) {
    var loggedUser = Meteor.user();
    if (! loggedUser) return;

    if (! RoleManager.bUserIsAdmin(loggedUser)){
      throw new Meteor.Error(403, 'Not admin');
    }

    var user = Meteor.users.findOne({ _id: userId });
    var currentHierRoles = _.findWhere(user.hierRoles, { hierId: loggedUser.currentHierId });

    if (!currentHierRoles){
      Meteor.users.update({ _id: userId }, { $push: { hierRoles: { roleIds:[roleId], hierId: loggedUser.currentHierId } } });
    } else {
      Meteor.users.update({ _id: userId, 'hierRoles.hierId': loggedUser.currentHierId }, { $addToSet: { 'hierRoles.$.roleIds': roleId } });
    }

  },
  removeRoleToUser: function (userId, roleId) {
    var loggedUser = Meteor.user();
    if (! loggedUser) return;

    if (! RoleManager.bUserIsClientAdmin(loggedUser)){
      throw new Meteor.Error(400, 'Not admin');
    }

    Meteor.users.update({ _id: userId, 'hierRoles.hierId': loggedUser.currentHierId }, { $pull: { 'hierRoles.$.roleIds': roleId } });

  }

});