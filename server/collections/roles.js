Meteor.publish('roles', function() {
  if (RoleManager.bUserIsSystemAdministrator()) return Roles.find();
  var sysadminrole=RoleManager.getSystemAdministratorRole();
  return Roles.find({_id: {$ne :sysadminrole._id}});
});
Roles.allow({

});