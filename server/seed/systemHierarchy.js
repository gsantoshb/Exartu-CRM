Meteor.startup(function () {
  var systemHier = Hierarchies.findOne({_id: ExartuConfig.SystemHierarchyId});
  if (systemHier)
    return;

  // Create system hierachy
  var hier = Hierarchies.insert(
    {
      _id: ExartuConfig.SystemHierarchyId,
      name: 'system',
      planCode: 1
    }
  );

  var systemUser = {
    username: 'exartu',
    email: ExartuConfig.systemUserEmail,
    password: ExartuConfig.systemUserPassword,
    profile: {
      hierId: hier
    }
  };

  var systemUserId = Accounts.createUser(systemUser);
  console.log(systemUserId);
  Meteor.users.update({_id: systemUserId, 'emails.address': ExartuConfig.systemUserEmail}, {$set: {'emails.$.verified': true }});
});

Meteor.methods({
  isSystemHier: function() { return Meteor.user()? Meteor.user().hierId == ExartuConfig.SystemHierarchyId : false; }
});