//
//
//
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
  getUserRoles: function(user) {
    if (!user) return [];
    if (!user.hierRoles) return [];
    var hr =_.findWhere(user.hierRoles,{hierId: user.currentHierId});
    var roles=(hr) ? hr.roleIds : [];
    return roles.map(function(item){ return item.roleId})
  },
  bUserHasRoleId: function(user,id)
  {
    var roleIds=RoleManager.getUserRoles(user);
    if (!_.contains(roleIds, id)) return false;
    return true;
  },
  bUserHasRoleName: function(user,name)
  {
    if (!_.contains(RoleManager.getUserRoles(user), RoleManager.getRoleFromName(name)._id)) return false;
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
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'jiawei.mo@aidacreative.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'javier.berneche@aidacreative.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'mihai.constantinescu@east-wolf.com') return true;
    if (user && user.emails[0] && user.emails[0].address.toLowerCase() == 'ionut.titei@east-wolf.com') return true;
    return RoleManager.bUserHasRoleId(user,this.getSystemAdministratorRole()._id)
  },
  bUserIsClientAdmin: function (user)
  {
    return RoleManager.bUserHasRoleId(user,this.getClientAdministratorRole()._id)
  }
};
