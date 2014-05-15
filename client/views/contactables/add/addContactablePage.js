ContactableAddController = RouteController.extend({
    layoutTemplate: 'addContactablePage',
    data: function(){
        Session.set('objType',this.params.objType);
    }
});
var contactable;
var subTypesDep=new Deps.Dependency;
var createContactable= function(objTypeName, options){
    var type=dType.core.getObjType(objTypeName)
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
}


Template.typeInput.helpers({
    isField: function (field) {
        return field.type=='field';
    }
})

//<editor-fold desc="***********************  fieldInput *********************">
Template.fieldInput.helpers({
    hasError :function(){
        return this.error? 'error': '';
    }
})
Template.lookUpFieldInput.helpers({
    options: function(){
//        debugger;
        return LookUps.find({codeType: this.lookUpCode});
    },
    hasError :function(){
        return this.error? 'error': '';
    }
})



//</editor-fold>

//<editor-fold desc="***********************  relInput *********************">

Template.relInput.helpers({
    options: function(){
        var q={};
        q[this.target]={ $exists: true };
        //todo: get collection from this.collection
        return Contactables.find(q);
    },
    hasError :function(){
        return this.error? 'error': '';
    },
    isDisabled:function(){
        return ! this.editable;
    },
    isSelected: function(id){
        return (this.value || this._id) ==id;
    }
})

//</editor-fold>


UI.registerHelper('displayProperty', function(){
    if(this.showInAdd){
        if(this.type=="field"){
            var template=Template[this.fieldType + 'FieldInput'] || Template['fieldInput'];
            template.events({
                'blur input': function(e){
                    switch (this.fieldType) {
                        case 'number':
                            this.value=Number.parseFloat(e.target.value);
                            break;
                        case 'date':
                            this.value=new Date(e.target.value);
                            break;
                        default:
                            this.value=e.target.value;
                    }
                    dType.isValidField(this);
                },
                'change select':function(e){
                    this.value=e.target.value;
                    dType.isValidField(this);
                }
            });
            return template
        }
        else{
            Template['relInput'].events({
                'change select':function(e){
                    this.value=e.target.value;
                }
            })
            return Template['relInput']
        }
    }
    return null;
})
