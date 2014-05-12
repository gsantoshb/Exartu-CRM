var getObjType=function(name){
    return  dType.ObjTypes.findOne({name: name});
}
dType.objTypeInstance=function(ObjTypeName){
    var objType=dType.core.getObjType(ObjTypeName);
    var model={};
    model.name=objType.name;
    model.fieldGroups=[];
    _.each(objType.fields, function(field){
        addToFieldGroup(model.fieldGroups, field.fieldGroup, new fieldInstance(field));
    })
    var visibilities= dType.core.getRelationsVisivilityOnType(objType);
    _.each(visibilities, function(v){
        addToFieldGroup(model.fieldGroups, v.fieldGroup, new relation(v));
    })
    if (objType.parent){
        var child=model;
        model=dType.objTypeInstance(objType.parent);
        if(! model.subTypes){
            model.subTypes=[];
        }
//        child.name=objType.name;
        model.subTypes.push(child);
    }
    return model;
}

var addToFieldGroup=function(fieldGroups, fieldGroupName, item){
    var fieldGroup=fieldGroupName || 'defaultGroup';

    if (!_.findWhere(fieldGroups,{fieldGroupName: fieldGroup}))
        fieldGroups.push({fieldGroupName: fieldGroup, items: []});

    _.findWhere(fieldGroups,{fieldGroupName: fieldGroup}).items.push(item)
}
dType.objTypeInstance.prototype={
    toKO:function(){
        var self=this;
        var result=ko.mapping.fromJS(self);
        return result
    }
}
var build=function(fieldGroups, object){
    var obj=object || {};
    _.each(fieldGroups, function(fieldGroup){
        _.each(fieldGroup.items, function(item){
            obj[item.name]=item.value;
        })
    });
    return obj
}
dType.buildAddModel=function(addModel){
    var obj={};
    obj.objNameArray=[];
    _.each(addModel.subTypes, function(subType){
        obj[subType.name]= build(subType.fieldGroups)
        obj.objNameArray.push(subType.name);
    })
    obj.objNameArray.push(addModel.name);
    build(addModel.fieldGroups, obj)

    return obj
}

var fieldInstance= function(field){
    var item=_.clone(field);
    var value;
    if (field.fieldType == 'string') {
        value= field.defaultValue;
        _.extend(item, {
            value: value
        });

    } else if (field.fieldType == 'lookUp') {
        value= field.defaultValue;
        _.extend(item, {
            value: value
        })
    } else{
        _.extend(item, {
            value: ko.observable()
        })
    }
    item.type='field';
    return item
}
dType.isValid=function(model){
    return _.every(model.fieldGroups,function(group){
        return _.every(group.items, function(field){
            if(field.type=='relation'){
                return dType.isValidRelation(field);
            }
            if(field.type=='field'){
                return dType.isValidField(field);
            }
        });
    }) && _.every(model.subTypes, function(type){
        return dType.isValid(type);
    })
}
dType.isValidRelation=function(rel){
    return rel.required ? (!! rel.value): true;
}
dType.isValidField= function(options){
    var error={};
    var result= dType.core.getFieldType(options.fieldType).validate(options.value, options, error);
    options.error=error.message;
    return result
}
var relation= function(relation){
    var rel= _.clone(relation);
    rel.type= 'relation';
    rel.value= relation.defaultValue;
    return rel
}