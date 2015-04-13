TenantUserView = new View('tenantUsers', {
    collection: Meteor.users,
    cursors: function (tenantUser) {
    }
});


Meteor.paginatedPublish(TenantUserView, function () {
    console.log('tenantUsers')
        var user = Meteor.users.findOne({
            _id: this.userId
        });
        if (!user)
            return [];
        if (!RoleManager.bUserIsSystemAdmin(user)){
          console.log('NOT admin');
          return [];
        }
        return TenantUserView.find();
    },
    {
        pageSize: 200,
        publicationName: 'tenantUsers'
    }
);

Meteor.publish('singleTenantUser', function (id) {
    var user = Meteor.users.findOne({
        _id: this.userId
    });
    if (!user)
        return [];
    if (!RoleManager.bUserIsSystemAdmin(user))
        return [];
    return TenantUserView.find({_id: id});
});

Meteor.publish('tenantUsersLogin', function (id) {
    var user = Meteor.users.findOne({
        _id: this.userId
    });
    if (!user)
        return [];
    if (!RoleManager.bUserIsSystemAdmin(user))
        return [];


    Meteor.Collection._publishCursor(Activities.find({ type: Enums.activitiesType.userLogin }), this, 'tenantUsersLogin');

});
