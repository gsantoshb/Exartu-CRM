Meteor.startup(function () {
  var systemHier = Hierarchies.findOne({_id: ExartuConfig.TenantId});
  if (systemHier)
    return;

  // Create system hierachy
  var hier = Hierarchies.insert(
    {
      _id: ExartuConfig.TenantId,
      name: 'system',
      planCode: 1,
      dateCreated: Date.now()
    }
  );
  var systemUser = {
    username: 'exartu',
    email: ExartuConfig.systemUserEmail,
    password: ExartuConfig.systemUserPassword,
    profile: {
      hierId: hier
    },
    roles : []
  };

  var systemUserId = Accounts.createUser(systemUser);
  Meteor.users.update({_id: systemUserId, 'emails.address': ExartuConfig.systemUserEmail}, {$set: {'emails.$.verified': true }});
});

Meteor.methods({
  isSystemHier: function() { return Meteor.user()? Meteor.user().hierId == ExartuConfig.TenantId : false; }
});