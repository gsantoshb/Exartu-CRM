Meteor.publish('roles', function() {
  return Roles.find();
});
Roles.allow({

});