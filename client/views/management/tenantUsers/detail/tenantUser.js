TenantUserController = RouteController.extend({
    template: 'tenantUser',
    layoutUser: 'mainLayout',
    waitOn: function () {
        SubscriptionHandlers.TenantHandler = TenantHandler = SubscriptionHandlers.TenantHandler || Meteor.paginatedSubscribe('tenants');
        return [Meteor.subscribe('singleTenantUser', this.params._id),TenantHandler,LookUpsHandler];
    },
    data: function () {
        Session.set('userId', this.params._id);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        this.render('tenantUser')
    },
    onAfterAction: function () {

    }
});
var user;
Template.tenantUser.helpers({
    userContext: function () {
        if (Session.get('userId')) {
            user = TenantUsers.findOne({_id: Session.get('userId')});
            return user;
        }
    },
    getUserName: function () {
        return Utils.getLocalUserName(user);
    },
    getUserEmail: function () {
        return user.emails[0].address;
    }

});
Template.tenantUser.events = {
    'change .inactive': function (e) {
        TenantUsers.update({_id: this._id}, {$set: {inactive: e.target.checked}});
    }
};
//
// maintain two lists...one of hiers that the user is a member of and that he is not
//
var avlSearchStringQuery = {};
queryAvl = new Utils.ObjectDefinition({
    reactiveProps: {
        searchString: {}
    }
});
var searchFields = ['_id', 'name'];

var hierDep=new Deps.Dependency;
var tenantUser;
Template.tenantUserHierMember.helpers({
    hierMember: function() {
        hierDep.depend();
        tenantUser = TenantUsers.findOne({_id: Session.get('userId')});
        return Tenants.find({_id:{$in: tenantUser.hierarchies}});
    }
});
Template.tenantUserHierMember.events = {
    'click #removeHier': function (e) {
        Meteor.call("removeUserFromTenant",user._id,this._id);
        hierDep.changed();
    }
};
Template.tenantUserHierAvailable.helpers({
    searchString: function() {
        return queryAvl.searchString;
    },
    hierAvailable: function() {
        tenantUser = TenantUsers.findOne({_id: Session.get('userId')});
        hierDep.depend();
        var searchQuery={};
        searchQuery._id={$nin: tenantUser.hierarchies};
        if (queryAvl.searchString.value) {
            var stringSearches = [];
            searchQuery.$and=[];
            _.each(searchFields, function (field) {
                var aux = {};
                aux[field] = {
                    $regex: queryAvl.searchString.value,
                    $options: 'i'
                };
                stringSearches.push(aux);
            });
            searchQuery.$and.push({
                $or: stringSearches
            });
        }

        return Tenants.find(searchQuery);
    }
});
Template.tenantUserHierAvailable.events = {
    'click #addHier': function (e) {
        Meteor.call('addUserToTenant',user._id,this._id,function(err,result){
            if (err) return console.log(err);
            var tenantUser = TenantUsers.findOne({_id: Session.get('userId')});
            hierDep.changed();
        });
    }
};
