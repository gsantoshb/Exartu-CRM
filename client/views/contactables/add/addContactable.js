ContactableAddController = RouteController.extend({
  data: function(){
    Session.set('objType',this.params.objType);
  },
  waitOn: function () {
    return Meteor.subscribe('lookUps');
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('addContactablePage');
  },
  onAfterAction: function() {
    var title = 'Add ' + Session.get('objType'),
      description = '';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

var contactable;
var subTypesDep=new Deps.Dependency;

var addDisabled = new ReactiveVar(false);
Template.addContactablePage.created=function(){
  addDisabled.set(false);
};
Template.addContactablePage.helpers({
  addDisabled: function () {
    return addDisabled.get();
  },
  isContact: function(){
    return Session.get('objType') === 'Contact';
  },
  isClient: function(){
    return Session.get('objType') === 'Client';
  },
  isEmployee: function(){
    return Session.get('objType') === 'Employee';
  },
  subTypeArray: function(){
    subTypesDep.depend();
    return contactable.subTypes;
  },
  objTypeName: function(){
    return Session.get('objType');
  },
  selected:function(personType){
    subTypesDep.depend();
    return contactable && contactable.subTypes && !!_.findWhere(contactable.subTypes,{name: personType});
  },
  getIcon: function(){
    var current=Router.current();
    if (!current) return '';
    return helper.getIconForObjName(current.params.objType)
  }

});

Template.addContactablePage.events({
  'click .goBack': function(){
    history.back();
  }
});

Template.addContactablePage.destroyed=function(){
  contactable = undefined;
};