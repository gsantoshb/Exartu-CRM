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

Template.user.created=function(){
  self.editMode=false;
};


var user;
var job;
var employee;
Template.user.helpers({
  roles: function() {
    return Meteor.roles().find();
  },
  user: function(){

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


});


Template.user_tabs.isActive = function(name){
  var activeTab = Session.get('activeTab') || 'details';
  return (name == activeTab) ? 'active' : '';
}

