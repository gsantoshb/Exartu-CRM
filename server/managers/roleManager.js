RoleManager = {
  getRoleFromName: function (name) {
    return Roles.findOne({name: name});
  },
  getRoleFromId: function(id)
  {
    return Roles.findOne({_id:id});
  },
  getSystemAdministratorRole: function() {
    return RoleManager.getRoleFromName(Enums.roleFunction.System_Administrator);
  },
  getClientAdministratorRole: function() {
    return RoleManager.getRoleFromName(Enums.roleFunction.Client_Administrator);
  },

  bUserHasRoleId: function(user,id)
  {
    if (!user) user=Meteor.users.findOne({ _id: this.userId });
    if (!user) return false;
    if (!user.roles) return false;
    if (!_.contains(user.roles, id)) return false;
    return true;
  },
  bUserHasRoleName: function(user,name)
  {
    if (!_.contains(user.roles, RoleManager.getRoleFromName(name)._id)) return false;
    return true;
  },
  bUserIsSystemAdmin: function (user)
  {
    if (!user) return false;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'greggd@aidacreative.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'aram.gugusian@aidacreative.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'nelson.campos@aidacreative.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'alex.armstrong@aidacreative.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'robert.armstrong@aidacreative.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'alex.armstrong@aidacreative.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'javier.berneche@aidacreative.com') return true;
    return RoleManager.bUserHasRoleId(user,this.getSystemAdministratorRole()._id)
  },
  bUserIsClientAdmin: function (user)
  {
    if (!user) return false;
    return RoleManager.bUserHasRoleId(user,this.getClientAdministratorRole()._id)
  }
};
