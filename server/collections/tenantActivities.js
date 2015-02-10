TenantActivitiesView = new View('tenantActivities', {
    collection: Activities,
    cursors: function (tenantActivities) {
    }
});


Meteor.paginatedPublish(TenantActivitiesView, function () {
        var user = Meteor.users.findOne({
            _id: this.userId
        });
        if (!user)
            return [];
        if (!RoleManager.bUserIsSystemAdmin(user))
            return [];
        return TenantActivitiesView.find({},{sort:{dateCreated:-1}});
    },
    {
        pageSize: 200,
        publicationName: 'tenantActivities'
    }
);

Meteor.publish('singleTenantActivities', function (id) {
    var user = Meteor.users.findOne({
        _id: this.userId
    });
    if (!user)
        return [];
    if (!RoleManager.bUserIsSystemAdmin(user))
        return [];
    return TenantActivitiesView.find({_id: id});
});
