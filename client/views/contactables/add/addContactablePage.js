ContactableAddController = RouteController.extend({
//    template: 'addContactablePage',
    layoutTemplate: 'addContactablePage',
    data: function(){
        Session.set('objType',this.params.objType);
    }
//    action: function () {
//        this.render('addContactablePage');
//    }
});
var contactable;

var createContactable= function(objTypeName){
    var objType=dType.core.getObjType(objTypeName);
    var contactable= new dType.objTypeInstance(objTypeName);
    setPersonType(objType.defaultPersonType, contactable);

    contactable._dep=new Deps.Dependency;

    return contactable
}
var setPersonType= function(personType, contactable){
        var personModel= new dType.objTypeInstance(personType)
        var personModel= personModel.subTypes[0];//get the actual person
        contactable.subTypes=contactable.subTypes.filter(function(obj) {
            return [Enums.personType.human, Enums.personType.organization].indexOf(obj.name) === -1;
        });
        contactable.subTypes.unshift(personModel);

}
Template.addContactablePage.helpers({
    contactable: function(){
        var contactable=Session.get('contactable');
//        console.dir(contactable)
        if (!contactable){
            contactable=createContactable(Session.get('objType'));
            Session.set('contactable', contactable);
        }
//        contactable._dep.depend();
        return contactable;
    },
    objTypeName: function(){
        return Session.get('objType');
    }
})

Template.addContactablePage.events({
    'change #personType': function(e){
        var contactable=Session.get('contactable');
        setPersonType(e.target.value, contactable)
        Session.set('contactable', contactable);
    },
    'click .btn-success': function(){
        if (!dType.isValid(this)){
            console.log('errorz')
            return;
        }
        var cont=dType.buildAddModel(this)
        console.dir(cont);
        Meteor.call('addContactable', cont, function(err, result){
            debugger;
        });
    },
    'blur input': function(e){
        //hackk
        var contactable=UI.getElementData($('.btn-success')[0]);
        Session.set('contactable', contactable);
    }
})

Template.addContactablePage.destroyed=function(){
    Session.set('contactable', undefined);
}



//<editor-fold desc="***********************  fieldInput *********************">
Template.fieldInput.helpers({
    hasError :function(){
        return this.error!=''? 'error': '';
    }
})
Template.fieldInput.events({
    'blur input': function(e){
        this.value=e.target.value;
//        if (! dType.isValidField(this)){
//            $(e.target.parentElement).addClass('error')
//        }
//        contactable._dep.changed();
    }
})
//</editor-fold>

Template.typeInput.helpers({
    isField: function (field) {
        return field.type=='field';
    }
})

//<editor-fold desc="***********************  relInput *********************">
Template.relInput.helpers({
    options: function(){
        var q={};
        q[this.target]={ $exists: true };
        //todo: get collection from this.collection
        return Contactables.find(q);
    }
})
Template.relInput.events({
    'change select':function(e){
//        debugger;
        this.value=e.target.value;
    }
})

//</editor-fold>