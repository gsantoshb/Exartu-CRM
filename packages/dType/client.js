var getObjType=function(name){
    return  dType.ObjTypes.findOne({name: name});
}


dType.objTypeInstance=function(ObjTypeName, options){
    var objType=dType.core.getObjType(ObjTypeName);
    var model={};

    model.name=ObjTypeName;
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
        model.subTypes.push(child);
    }
    if(options)
        applyOptions(model, options);

    return model;
}
var applyOptions=function(model, options){
    var keys= _.keys(options);
    _.each(model.subTypes, function(subType){
        if(_.contains(keys, subType.name)){
            applyOptions(subType,options[subType.name])
        }
    })

    _.each(model.fieldGroups,function(group){
        _.each(group.items, function(item){
            if(_.contains(keys, item.name)){
                makeReadOnly(item, options[item.name])
            }
        });
    });
}
var makeReadOnly=function(item, value){
    item._value=value;
    item.editable=false;
}

var addToFieldGroup=function(fieldGroups, fieldGroupName, item){
    var fieldGroup=fieldGroupName || 'defaultGroup';

    if (!_.findWhere(fieldGroups,{fieldGroupName: fieldGroup}))
        fieldGroups.push({fieldGroupName: fieldGroup, items: []});

    _.findWhere(fieldGroups,{fieldGroupName: fieldGroup}).items.push(item)
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
    var obj= {
        objNameArray:[]
    };

    _.each(addModel.subTypes, function(subType){
        obj[subType.name]= build(subType.fieldGroups);
        obj.objNameArray.push(subType.name)
    })

    build(addModel.fieldGroups, obj)
    obj.objNameArray.push(addModel.name)
    return obj
}
var reactiveProp=function(object, key, value){
    var depName='_dep'+key
    var valueName='_'+key
    object[depName]= new Deps.Dependency;
    object[valueName]= value;

    Object.defineProperty(object, key,{
        get:function(){
            this[depName].depend();
            return this[valueName];
        },
        set:function(newValue){
            this[valueName]=newValue;
            this[depName].changed();
        }
    })
}
var fieldInstance= function(field){
    var item= _.clone(field);

    reactiveProp(item, 'value', field.defaultValue);
    reactiveProp(item, 'error', '');

    item.type='field';
    item.editable=true;
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
dType.displayAllMessages=function(model){
    _.each(model.fieldGroups,function(group){
        _.each(group.items, function(field){
            if(field.type=='relation'){
                dType.isValidRelation(field);
            }
            if(field.type=='field'){
                dType.isValidField(field);
            }
        });
    })
    _.each(model.subTypes, function(type){
        return dType.displayAllMessages(type);
    })
}
dType.isValidRelation=function(rel){
    if (rel.required && !! rel.value){
        relation.error='this field is required';
        return false
    }
    return true;
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

    reactiveProp(rel, 'value', relation.defaultValue);
    reactiveProp(rel, 'error', '');
    rel.editable = true;

    return rel;
}