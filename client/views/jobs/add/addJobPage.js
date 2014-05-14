JobAddController = RouteController.extend({
    layoutTemplate: 'addJobPage',
    data: function(){
        Session.set('objType',this.params.objType);
    }
});
var model;
var subTypesDep=new Deps.Dependency;
var createJob= function(objTypeName){
//    var type=dType.core.getObjType(objTypeName)
    model= new dType.objTypeInstance(objTypeName);
//    setPersonType(type.defaultPersonType,contactable)
    return model
}
//var setPersonType= function(personType, contactable){
//    var personModel= new dType.objTypeInstance(personType)
//    contactable.subTypes=contactable.subTypes.filter(function(obj) {
//        return [Enums.personType.human, Enums.personType.organization].indexOf(obj.name) === -1;
//    });
//    contactable.subTypes.unshift(personModel);
//    subTypesDep.changed();
//}
Template.addJobPage.helpers({
    model: function(){
        if (!model){
            model=createJob(Session.get('objType'));
        }
        return model;
    },
    subTypeArray: function(){
        subTypesDep.depend();
        return model.subTypes;
    },
    objTypeName: function(){
        return Session.get('objType');
    }
//    selected:function(personType){
//        subTypesDep.depend();
//        return contactable && contactable.subTypes && !!_.findWhere(contactable.subTypes,{name: personType});
//    }
})

Template.addJobPage.events({
//    'change #personType': function(e){
//        setPersonType(e.target.value, contactable)
//    },
    'click .btn-success': function(){
        if (!dType.isValid(model)){
            dType.displayAllMessages(model);
            return;
        }
        var obj=dType.buildAddModel(model)
        Meteor.call('addJob', obj, function(err, result){
        });
    }
})

Template.addJobPage.destroyed=function(){
    model=undefined;
}