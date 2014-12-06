Meteor.publish('tenantAdmins', function() {
  return TenantAdmins.find();
});