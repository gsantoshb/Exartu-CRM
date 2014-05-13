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
var subTypesDep=new Deps.Dependency;
var createContactable= function(objTypeName){
    var type=dType.core.getObjType('Customer')
    contactable= new dType.objTypeInstance(objTypeName);
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
    console.log(personType);
}
Template.addContactablePage.helpers({
    contactable: function(){
        if (!contactable){
            contactable=createContactable(Session.get('objType'));
        }
        console.dir(contactable)

        return contactable;
    },
    subTypeArray: function(){
        subTypesDep.depend();
        return contactable.subTypes;
    },
    objTypeName: function(){
        return Session.get('objType');
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
//        console.dir(cont);
        Meteor.call('addContactable', cont, function(err, result){
//            debugger;
        });
    }
})

Template.addContactablePage.destroyed=function(){
    delete contactable;
}



//<editor-fold desc="***********************  fieldInput *********************">
Template.fieldInput.helpers({
    hasError :function(){
        return this.error? 'error': '';
    }
})
//Template.fieldInput.events({
//    'blur input': function(e, data){
//        debugger;
//        this.value=e.target.value;
//        dType.isValidField(this)
////        if (! dType.isValidField(this)){
////            $(e.target.parentElement).addClass('error')
////        }
////        contactable._dep.changed();
//    }
//
//})
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
//Template.relInput.events({
//    'change select':function(e, data){
//        this.value=e.target.value;
////        contactable._dep.changed();
//    }
//})

//</editor-fold>


UI.registerHelper('displayProperty', function(parameters){
    var self = this;
    if(this.showInAdd){
//        debugger;
        if(this.type=="field"){
            Template['fieldInput'].events({
                'blur input': function(e, data){
//                    debugger;
                    this.value=e.target.value;
                    dType.isValidField(this);
                }
            });
            return Template['fieldInput']
        }
        else{
            Template['relInput'].events({
                'change select':function(e, data){
                    this.value=e.target.value;
                }
            })
            return Template['relInput']
        }
    }
    return null;
})

//{{#if isField .}}
//    {{#if showInAdd}}
//        {{>fieldInput .}}
//        {{/if}}
//            {{else}}
//            {{#if showInAdd}}
//                {{>relInput .}}
//                {{/if}}
//                    {{/if}}