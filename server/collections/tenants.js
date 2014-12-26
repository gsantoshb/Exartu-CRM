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

Tenants.allow({
  update: function (userId, file, fields, modifier) {
    var user = Meteor.users.findOne({
      _id: userId
    });
    //console.log('user',userId,'file',file,'fields',fields,'modifier',modifier);
    // we get here with
    //   'userId' as the userID of the meteor user
    //   'file' is the user record being updated
    //   'fields' is an array of the fields being updated.  Example:  [ 'roles' ]
    //   'modifier' is the mongo update clause.  Example: { '$set': { roles: [ 'e5fFGgw5EkTWv2L5R', 'F9w4wLZqMTu75bGS7' ] }
    //   some checks that need to happen here:
    //      verify that the meteor user doing the updating is either system admin or tenant admin
    //      verify that the if the systemadmin role is being added that the user is system admin
    //

    if (!RoleManager.bUserIsSystemAdmin(user)) {
      return false;
    }
    return true;
  }
});