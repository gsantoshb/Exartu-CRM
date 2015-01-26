Meteor.publish('roles', function() {
  var user = Meteor.users.findOne({ _id: this.userId });
  if (RoleManager.bUserIsSystemAdmin(user)) return Roles.find();
  var sysadminrole=RoleManager.getSystemAdministratorRole();
  return (sysadminrole) ? Roles.find({_id: {$ne :sysadminrole._id}}) : null;
});
Roles.allow({

});