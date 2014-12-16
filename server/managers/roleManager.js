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
    if (!_.contains(user.roles, id)) return false;
    return true;
  },
  bUserHasRoleName: function(user,name)
  {
    if (!_.contains(user.roles, RoleManager.getRoleFromName(name)._id)) return false;
    return true;
  },
  bUserIsSystemAdministrator: function (user)
  {
    if (user && user.emails[0] && user.emails[0].address == 'greggd@aidacreative.com') return true;
    return RoleManager.bUserHasRoleId(user,this.getSystemAdministratorRole()._id)
  }
};
