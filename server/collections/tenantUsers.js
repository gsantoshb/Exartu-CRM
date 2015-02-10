TenantUserView = new View('tenantUsers', {
    collection: Meteor.users,
    cursors: function (tenantUser) {
    }
});


Meteor.paginatedPublish(TenantUserView, function () {
        var user = Meteor.users.findOne({
            _id: this.userId
        });
        if (!user)
            return [];
        if (!RoleManager.bUserIsSystemAdmin(user))
            return [];
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
