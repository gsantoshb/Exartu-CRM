var hierId ;
var userId;
TenantController = RouteController.extend({
    template: 'tenant',
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        hierId=this.params._id;
        SubscriptionHandlers.TenantUserHandler = TenantUserHandler = SubscriptionHandlers.TenantUserHandler
        || Meteor.paginatedSubscribe('tenantUsers');
        SubscriptionHandlers.TenantActivitiesHandler = TenantActivitiesHandler = SubscriptionHandlers.TenantActivitiesHandler
        || Meteor.paginatedSubscribe('tenantActivities');
        return [Meteor.subscribe('singleTenant',hierId),TenantUserHandler ];
    },
    data: function () {
        Session.set('tenantId', this.params._id);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        this.render('tenant')
    },
    onAfterAction: function () {

    }
});

Template.tenant.created= function() {
    userId=Meteor.user()._id;
}
Template.tenant.helpers({
    tenantJSON: function()
    {
        var tenant = Tenants.findOne(hierId);
        return JSON.stringify(tenant);
    },
    tenantContext: function () {
            var tenant = Tenants.findOne(hierId);
            return tenant;
    },
    users: function () {
        return TenantUsers.find({hierarchies: hierId});
    },
    activities: function () {
        return TenantActivities.find({hierId: hierId},{sort: {'data.dateCreated':-1}});
    },
    usersCount: function() {
        return TenantUsers.find({hierarchies: hierId}).count();
    },
    isMember: function() {
        var member=TenantUsers.findOne({hierarchies: hierId,_id: userId});
        return (member) ? true: false;
    },
    isCurrent: function() {
        var member = TenantUsers.findOne({hierarchies: hierId, _id: userId});
        if (!member) return false;
        return (member.currentHierId==hierId) ;
    }
});
Template.tenant.events = {
    'change .inactiveHier': function (e) {
        Hierarchies.update({_id: hierId}, {$set: {inactive: e.target.checked}});
        alert('hierarchy inactive flag set to ' + e.target.checked);

    },
    'click .make-current': function () {
        Meteor.call('changeCurrentHierId', hierId, function (err, result) {
            if (err)
                console.error(err);
            else {
                Meteor.disconnect();
                Meteor.reconnect();
            }
        })

    },    'click .join-hierarchy': function () {
        Meteor.call('addUserToHierarchy', userId, hierId);
        alert('hierarchy joined');
    },
    'change .inactive': function(e)
    {
        if (this._id==userId && e.target.checked)
        {
            alert("This would log you out and so no we aren't going to deactivate you.");
            e.target.checked=false;
            return;
        }
        var upd={};
        upd.$set= { inactive: e.target.checked };
        Meteor.users.update({_id: this._id}, upd, function(err) {
            if (err) {
                alert(err);
            };
        });
        alert('user inactive flag set to ' + e.target.checked );
    }
}