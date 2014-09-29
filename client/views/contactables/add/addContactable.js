ContactableAddController = RouteController.extend({
//    layoutTemplate: 'addContactablePage',
  data: function(){
    Session.set('objType',this.params.objType);
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

var createContactable= function(objTypeName, options){
  var type= dType.core.getObjType(objTypeName);
  contactable= new dType.objTypeInstance(objTypeName, options);
  setPersonType(type.defaultPersonType,contactable);
  return contactable
};

var setPersonType= function(personType, contactable){
  var personModel= new dType.objTypeInstance(personType);
  contactable.subTypes=contactable.subTypes.filter(function(obj) {
    return [Enums.personType.human, Enums.personType.organization].indexOf(obj.name) === -1;
  });
  contactable.subTypes.unshift(personModel);
  subTypesDep.changed();
};

var extraInformation = new Utils.ObjectDefinition({
  reactiveProps: {
    email: {
      validator: function() {
        return helper.emailRE.test(this.value);
      }
    },
    phoneNumber: {}
  }
});

Template.addContactablePage.helpers({
  contactable: function(){
    if (!contactable){
      var options=Session.get('options');
      if (options){
        Session.set('options',undefined);
      }
      contactable=createContactable(Session.get('objType'), options);
    }
    return contactable;
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
  },
  extraInformation: function() {
    return extraInformation;
  }
});

Template.addContactablePage.events({
  'change #personType': function(e){
    setPersonType(e.target.value, contactable)
  },
  'click .btn-success': function(){
    if (!dType.isValid(this)){
      dType.displayAllMessages(this);
      return;
    }
    var cont=dType.buildAddModel(this);

    // Extend contactable with extra information
    // - Contact methods
    cont.contactMethods = [];
    if (extraInformation.email.value) {
      if (extraInformation.email.error.hasError)
        return;

      var emailContactMethodLookUp = ContactMethods.findOne({type: Enums.contactMethodTypes.email});
      cont.contactMethods.push({
        type: emailContactMethodLookUp._id,
        value: extraInformation.email.value
      });
    }
    if (extraInformation.phoneNumber.value) {
      if (extraInformation.phoneNumber.error.hasError)
        return;

      var emailContactMethodLookUp = ContactMethods.findOne({type: Enums.contactMethodTypes.phone});
      cont.contactMethods.push({
        type: emailContactMethodLookUp._id,
        value: extraInformation.phoneNumber.value
      });
    }

    extraInformation.reset();

    Meteor.call('addContactable', cont, function(err, result){
      if(err){
        console.dir(err)
      }else{
        GAnalytics.event("/contactableAdd", Session.get('objType'));
        Router.go('/contactable/' + result + '#tasks');
      };
    });
  },
  'click .goBack': function(){
    history.back();
  }
});

Template.addContactablePage.destroyed=function(){
  contactable = undefined;
};