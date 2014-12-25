
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
    if (!RoleManager.bUserIsSystemAdmin(user))
      return null;
    return TenantUserView.find();
  },
  {
  pageSize: 10,
  publicationName: 'tenantUsers'
  }
);

Meteor.publish('singleTenantUser', function (id) {
  return  TenantUserView.find({_id: id});
});
