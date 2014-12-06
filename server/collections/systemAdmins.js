Meteor.publish('systemAdmins', function() {
  var user = Meteor.users.findOne({ _id: this.userId });
  if (_.indexOf(user.roles, Enums.roleFunction.System_Administrator) == -1)  return null;
  else
  return SystemAdmins.find();
});


Meteor.publish('systemHiers', function() {
  var user = Meteor.users.findOne({ _id: this.userId });
  if (_.indexOf(user.roles, Enums.roleFunction.System_Administrator) == -1)  return null;
  else
    return Hierarchies.find();
});