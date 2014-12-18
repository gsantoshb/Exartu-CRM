
TenantUserView = new View('tenantUsers', {
  collection: Meteor.users,
  cursors: function(tenantUser)
  {
  }
});


Meteor.paginatedPublish(TenantUserView, function()
  {
    var user = Meteor.users.findOne({
      _id: this.userId
    });
    if (!user)
      return false;
    if (!RoleManager.bUserIsSystemAdministrator(user))
      return null;
    return TenantUserView.find();
  },
  {
  pageSize: 10,
  publicationName: 'tenantUsers'
  }
);

