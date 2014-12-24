Meteor.publish('roles', function() {
  var user = Meteor.users.findOne({ _id: this.userId });
  if (RoleManager.bUserIsSystemAdministrator(user)) return Roles.find();
  var sysadminrole=RoleManager.getSystemAdministratorRole();
  return Roles.find({_id: {$ne :sysadminrole._id}});
});
Roles.allow({

});