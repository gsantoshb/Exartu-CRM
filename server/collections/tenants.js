TenantView = new View('tenants', {
  collection: Hierarchies,
  cursors: function(tenant)
  {
  }
});


Meteor.paginatedPublish(TenantView, function()
  {
    var user = Meteor.users.findOne({
      _id: this.userId
    });
    if (!user)
      return false;
    if (!RoleManager.bUserIsSystemAdministrator(user))
      return null;
    return TenantView.find();
  },
  {
  pageSize: 10,
  publicationName: 'tenants'
  }
);

