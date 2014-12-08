UserController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function(){
    return [GoogleMapsHandler]
  },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action:function(){
    if (!this.ready()) {
      this.render('loadingContactable')
      return;
    }
    this.render('user')
    Session.set('activeTab', this.params.hash);
  }
});



var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);
var services;
var rolesDep=new Deps.Dependency;

Template.user.created=function(){
  self.editMode=false;
};


var user;
var job;
var employee;
Template.selectUserRole.helpers({
  availableRoles: function() {
    rolesDep.depend();
    var avlRoles=  roles.find().fetch();
    var user=Meteor.users.findOne({ _id: Session.get('entityId') });
    return _.filter(avlRoles, function (role) {
      return !_.findWhere(user.roles, role.name);
    });
  }
})
Template.user.helpers({
  user: function(){
    rolesDep.depend();
    var user=Meteor.users.findOne({ _id: Session.get('entityId') });


    return user;
  },
  editMode:function(){
    return self.editMode;
  },
  colorEdit:function(){
    return self.editMode ? '#008DFC' : '#ddd'
  }

});

Template.user.events({
  'click .removeRole': function(e, ctx){
    var user=Meteor.users.findOne({ _id: Session.get('entityId') });
    user.roles.splice(user.roles.indexOf(this), 1);
    Meteor.users.update({_id: Meteor.userId()}, {$set : {roles: user.roles}}, function(err) {
    });
    rolesDep.changed();
  }

});

Template.selectUserRole.events({
  'click .addRole': function(e, ctx){
    var newRole =ctx.$('.newRole').val();
    var user=Meteor.users.findOne({ _id: Session.get('entityId') });
    if (!user.role || user.role==null) user.roles=[];
    if (_.indexOf(user.roles, newRole) == -1)  user.roles.push(newRole);
    Meteor.users.update({_id: Meteor.userId()}, {$set : {roles: user.roles}}, function(err) {
    });
    rolesDep.changed();
  }
});

Template.user_tabs.isActive = function(name){
  var activeTab = Session.get('activeTab') || 'details';
  return (name == activeTab) ? 'active' : '';
}

