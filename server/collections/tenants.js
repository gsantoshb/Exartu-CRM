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
    if (!RoleManager.bUserIsSystemAdmin(user))
      return null;
    return TenantView.find();
  },
  {
  pageSize: 10,
  publicationName: 'tenants'
  }
);

Meteor.publish('singleTenant', function (id) {
  return TenantView.find({_id: id});
});

