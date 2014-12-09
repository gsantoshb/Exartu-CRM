Meteor.publish('tenants', function() {
  var user = Meteor.users.findOne(this.userId);
  if (!user)
    return false;
//  var sysAdmin=systemAdmins.findOne({_id: user._id});
//  if ( !sysAdmin) return null;
  return Hierarchies.find();
});

