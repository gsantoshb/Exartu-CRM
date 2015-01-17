TenantController = RouteController.extend({
    template: 'tenant',
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        return [Meteor.subscribe('singleTenant', this.params._id)];
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
var hierId ;
var userId;
Template.tenant.created= function() {
    hierId=Session.get('tenantId');
    userId=Meteor.user()._id;
}
Template.tenant.helpers({
    tenantContext: function () {
        if (hierId) {
            var tenant = Tenants.findOne(hierId);
            return tenant;
        }
    },
    users: function () {
        return Meteor.users.find({hierarchies: hierId});
    },
    usersCount: function() {
        return Meteor.users.find({hierarchies: hierId}).count();
    },
    isMember: function() {
        var member=Meteor.users.findOne({hierarchies: hierId,_id: userId});
        return (member) ? true: false;
    }
});
Template.tenant.events = {
    'change .inactive': function (e) {
        Hierarchies.update({_id: hierId}, {$set: {inactive: e.target.checked}});
    },
    'click .join-hierarchy': function () {
        Meteor.call('addUserToHierarchy', userId, hierId);
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
    },
}