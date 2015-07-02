var editMode = new ReactiveVar(false);
var location = {};
Utils.reactiveProp(location, 'value', null);
var services;
var rolesDep = new Deps.Dependency;

Template.userRoles.onCreated(function () {
  editMode.set(false);
});

var user;
var job;
var employee;
Template.selectUserRole.helpers({
  isAdmin: Utils.bUserIsAdmin,
  availableRoles: function () {
    rolesDep.depend();
    var avlRoles = roles.find().fetch();
    var user = Meteor.users.findOne({_id: this.userId});
    if (!user) return;
    return _.filter(avlRoles, function (role) {
      var currHierRole = _.findWhere(user.hierRoles, {hierId: user.currentHierId});
      if (!currHierRole) return true;
      return !_.contains(currHierRole.roleIds, role._id);
    });
  }
});

Template.userRoles.helpers({
  user: function () {
    rolesDep.depend();
    return Meteor.users.findOne({_id: this.userId});
  },
  editMode: function () {
    return editMode.get();
  },
  colorEdit: function () {
    return editMode.get() ? '#008DFC' : '#ddd'
  }

});

Template.userRoles.events({
  'click .removeRole': function (e, ctx) {

    Meteor.call('removeRoleToUser', ctx.data.userId, this.id, function (err, result) {
      err && console.log(err);
    });
  }

});

Template.selectUserRole.events({
  'click .addRole': function (e, ctx) {
    var newRoleId = ctx.$('.newRole').val();
    if (!newRoleId) return;

    Meteor.call('addRoleToUser', ctx.data.userId, newRoleId, function (err, result) {
      err && console.log(err);
    });

  }
});

Template.roleList.helpers({
  getRoleDisplayName: function () {
    var role = roles.findOne(this.id);
    if (!role) {
      console.log('role not found', this.id);
      return;
    }
    return role.name;
  },
  roles: function () {
    var user = Meteor.users.findOne({_id: this.userId});
    var currHierRoles = _.findWhere(user.hierRoles, {hierId: user.currentHierId});
    return _.map(currHierRoles.roleIds, function (id) {
      return {id: id};
    });
  },
  isAdmin: Utils.bUserIsAdmin
});

