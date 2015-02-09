UserController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        return [GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('user');
        Session.set('activeTab', this.params.hash);
    }
});


var self = {};
Utils.reactiveProp(self, 'editMode', false);
var location = {};
Utils.reactiveProp(location, 'value', null);
var services;
var rolesDep = new Deps.Dependency;

Template.user.created = function () {
    self.editMode = false;
};


var user;
var job;
var employee;
Template.selectUserRole.helpers({
    availableRoles: function () {
        rolesDep.depend();
        var avlRoles = roles.find().fetch();
        var user = Meteor.users.findOne({_id: Session.get('entityId')});
        if (!user) return;
        return _.filter(avlRoles, function (role) {
            var currHierRole= _.findWhere(user.hierRoles, {hierId: user.currentHierId});
            if (!currHierRole) return true;
            return !_.contains(currHierRole.roleIds,role._id);
        });
    }
})
Template.user.helpers({
    user: function () {
        rolesDep.depend();
        var user = Meteor.users.findOne({_id: Session.get('entityId')});


        return user;
    },
    editMode: function () {
        return self.editMode;
    },
    colorEdit: function () {
        return self.editMode ? '#008DFC' : '#ddd'
    }

});

Template.user.events({
    'click .removeRole': function (e, ctx) {
        var user = Meteor.users.findOne({_id: Session.get('entityId')});
        var currHierRoles = _.findWhere(user.hierRoles,{hierId:user.currentHierId});
        var newHierRoles= _.reject(currHierRoles,function(el) { el.hierId==user.currentHierId});
        var currRoles=currHierRoles.roleIds;
        currRoles.splice(currRoles.indexOf(this._id), 1);
        //
        //var newRoles = _.reject(currRoles,function (el) {
        //    console.log('el',el,this._id,'currRoles',currRoles);
        //    return !( el == this._id)
        //});
        newHierRoles.push({hierId:user.currentHierId,roleIds:currRoles});
        Meteor.users.update({_id: Session.get('entityId')}, {$set: {hierRoles: newHierRoles}}, function (err) {
        });
        rolesDep.changed();
    }

});

Template.selectUserRole.events({
    'click .addRole': function (e, ctx) {
        var newRoleId = ctx.$('.newRole').val();
        var user = Meteor.users.findOne({_id: Session.get('entityId')});
        var currHierRoles = _.findWhere(user.hierRoles,{hierId:user.currentHierId});
        var newHierRoles= (currHierRoles) ? _.reject(currHierRoles,function(el) { el.hierId==user.currentHierId}) : [];
        var currRoleIds=(currHierRoles && currHierRoles.roleIds) ? currHierRoles.roleIds: [];
        currRoleIds.push(newRoleId)
        newHierRoles.push({hierId:user.currentHierId,roleIds:currRoleIds});
        Meteor.users.update({_id: Session.get('entityId')}, {$set: {hierRoles: newHierRoles}}, function (err) {
            if (err) console.log('userhr',err);
        });
        rolesDep.changed();
    }
});

Template.user_tabs.helpers({
    isActive: function (name) {
        var activeTab = Session.get('activeTab') || 'details';
        return (name == activeTab) ? 'active' : '';
    },
    getRoleName: function (id) {
        var role = roles.findOne({_id: id});
        if (role) return role.name; else return "role not found";
    },
    roles: function() {
        var user = Meteor.users.findOne({_id: Session.get('entityId')});
        var currHierRoles = _.findWhere(user.hierRoles,{hierId:user.currentHierId});
        return currHierRoles.roleIds;
    }

});

