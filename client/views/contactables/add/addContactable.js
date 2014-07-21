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
    var type= dType.core.getObjType(objTypeName)
    contactable= new dType.objTypeInstance(objTypeName, options);
    setPersonType(type.defaultPersonType,contactable)
    return contactable
}
var setPersonType= function(personType, contactable){
    var personModel= new dType.objTypeInstance(personType)
    contactable.subTypes=contactable.subTypes.filter(function(obj) {
        return [Enums.personType.human, Enums.personType.organization].indexOf(obj.name) === -1;
    });
    contactable.subTypes.unshift(personModel);
    subTypesDep.changed();
}
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
    }
})

Template.addContactablePage.events({
    'change #personType': function(e){
        setPersonType(e.target.value, contactable)
    },
    'click .btn-success': function(){

        if (!dType.isValid(this)){
            dType.displayAllMessages(this);
            return;
        }
        var cont=dType.buildAddModel(this)
        Meteor.call('addContactable', cont, function(err, result){
            if(err){
                console.dir(err)
            }else{
                GAnalytics.event("/contactableAdd", Session.get('objType'));
                history.back();
            }
        });
    },
    'click .goBack': function(){
        history.back();
    }
})

Template.addContactablePage.destroyed=function(){
   contactable=undefined;
};