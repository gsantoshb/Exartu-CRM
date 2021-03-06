Meteor.publish('systemConfigs', function () {
  return SystemConfigs.find();
});
Meteor.publish('systemAdmins', function() {
  var user = Meteor.users.findOne({ _id: this.userId });
  if (!user) return null;
  if (!user.roles) return null;
  if (!_.contains(user.roles, RoleManager.getSystemAdministratorRole()._id)) return null;
  else
    return SystemAdmins.find();
});
