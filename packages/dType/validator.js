if (!dType){
    dType={};
}
dType.validator={
    validateInsert: function(userId, doc){
        var types= dType.core.getObjBaseTypes(doc);
        return _.every(types, function(type){
            if(type.customValidation){
                return type.customValidation(doc);
            }
            return isValidObj(type, doc);
        })
    },
    validateUpdate: function(userId, doc, fieldNames, modifier, options){
        if(modifier.__notRunHook){
            delete modifier.__notRunHook;
            return this._super.call(this.context,userId, doc, fieldNames, modifier, options)
        }
        var baseTypes=dType.core.getObjBaseTypes(doc);
        return _.every(baseTypes, function(type){
            //todo: suport $push, $addToSet, etc
            return isValidObjUpdate(type, modifier.$set);
        })
    }
}
//loop throw the obj keys, find out what that key represents (field, relation, etc) and validate it
// if the key represents a child objType, then it validates that child
var isValidObj= function(type, obj, isUpdate){
    if(!isUpdate){
        //check if the obj has every required key
        var required=getRequiredkeys(type);
        if (! isContained(required, _.keys(obj))){
            console.log('the obj is not valid, some required keys missing for type '+type.name)
            return false;
        }
        completeObj(type, obj);
    }
    return _.every(_.keys(obj), function(key){
        return isValidProperty(type, obj, key);
    })
}

var getRequiredkeys= function(type){
    var result=[];
    _.each(type.fields,function(field){
        if (field.required || field.defaultValue === undefined){
            result.push(field.name);
        }
    })
    return result;
}

var isContained= function(contained, cointainee){
    return _.every(contained,function(item){
        return _.contains(cointainee, item);
    })
}

var completeObj= function(type, obj){
    //fields
    var optional=[];
    _.each(type.fields,function(field){
        if (!field.required && field.defaultValue !== undefined){
            optional.push({key: field.name, value: field.defaultValue});
        }
    })
    _.each(optional, function(opt){
        if(obj[opt.key] === undefined){
            obj[opt.key]= _.isFunction(opt.value) ? opt.value() : opt.value;
        }
    })

    //services
    var service;
    _.each(type.services,function(serviceSetting){
        service= dType.core.getService(serviceSetting.name);
        if (service.initValue){
            obj[service.name]= service.initValue(obj[service.name]);
        }
    });

};
// validates an updateObject (a mongo modifier object) transforming it in a nested object (see getFormatedModifier)
// and then it proceeds as isValidObj but not checking the completeness
var isValidObjUpdate= function(baseType, modifier){
    var formatedModifier=getFormatedModifier(modifier);
    return _.every(_.keys(formatedModifier), function(key){
        return isValidProperty(baseType, formatedModifier, key, true);
    })
}

var isValidProperty= function(type, obj, propName, isUpdate){
    var result;
    result=isField(type, propName);
    if (result){
        console.log('validating field: ' + propName);
        return isValidField(result, obj[propName]);
    }
    result=isService(type, propName);
    if (result){
        console.log('validating service: ' + propName);
        return result.isValid(obj[propName], result.setting)
    }
    result=isRelation(type, propName);
    if (result){
        console.log('validating relation: ' + propName);
        var v= isValidRelation(result, obj[propName])
        if(!v){
            console.log('invalid rel')
        }
        return v;
    }
    result=isSubType(type, propName);
    if (result){
        console.log('validating subType: ' + propName);
        return isValidObj(result, obj[propName], isUpdate);
    }
//    console.log(propName + ' is nothing')
    return true;
}

var isField= function(type, propName){
    return _.findWhere(type.fields,{name: propName});
}
var isService= function(type, propName){
    var setting=_.findWhere(type.services,{name: propName})
    if (setting){
        var service=dType.core.getService(propName);
        service.setting=setting;
        return service;
    }
}
var isRelation= function(type,propName){
    var rels=dType.core.getRelationsVisivilityOnType(type);
//    console.dir(rels);
    return _.findWhere(rels, { name:propName });
}
var isSubType= function(type, propName){
    var subType= dType.core.getObjType(propName);
    if (subType && ( (subType.parent == type.name) || (! subType.collection && !subType.parent))){
        return subType;
    }
}

var isValidField= function(field, value){
    var error={}
    var aux= dType.core.getFieldType(field.fieldType).validate(value, field, error);
    if(!aux){
        console.log('value: ' + value + ' is not valid for field ' + field.name+':')
        console.log(error.message)
    }
    return aux;
}
var isValidRelation= function(visibility, value){
    debugger;
    if (!checkCardinality(value, visibility.cardinality)){
        console.log('invalid card')
        return false;
    }
    if(value){
        if (visibility.cardinality.max == 1) {
            //check if the value's type is the same as this relation's target (rel.obj2)

            return checkType(value, visibility.target, dType.core.getCollection(visibility.collection));
        }
        else {
            //checking if all the values are correct
            return _.every(value, function (val) {
                return checkType(val, visibility.target, dType.core.getCollection(visibility.collection));
            });
        }
    }else{
        return true;
    }
    //todo check other side
}
// check if value adjust to card
var checkCardinality = function (value, card) {
    if (!value) {
        //the cardinality allows no value?
        return card.min <= 0;
    }
    if (typeof value == typeof[]) {
        if (card.max == 1) {
            return false;
        } else {
            return value.length <= card.max && value.length >= card.min;
        }
    } else {
        if (card.max > 1) {
            return false;
        }
    }
    return true;
}

/*
 * check if obj is of type typeName
 * params:
 *  obj ->  the id of the object
 *          or the actual object
 * typeName ->      the name of the type we are matching against (ex: 'Employee')
 * collection ->    if obj is of the id of the obj this parameter is required
 */
var checkType = function (obj, typeName, collection) {

    if (_.isObject(obj))
        return obj.objNameArray && _.isArray(obj.objNameArray) && (obj.objNameArray.indexOf(typeName) >= 0);
    else {
//        console.log('collection')
//        console.dir(collection.find().fetch());
//        console.log('obj')
//        console.dir(obj);
//        console.log('objNameArray')
//        console.dir(typeName);
        var exists = collection.findOne({
            _id: obj,
            objNameArray: typeName
        }, {
            _id: 1
        });
        if (!exists){
            console.log(obj+'not Exists')
        }
        return exists != undefined;
    }
}


var getFormatedModifier= function(modifier){

    if(!_.isObject(modifier)){
        return {};
    }else{
        var result ={};
        _.each(_.keys(modifier), function(key){
            var parts= key.split('.');
            result[parts[0]]= getFormatedParts(modifier, parts.slice(1), modifier[key]);
        })
        return result;
    }
}
var getFormatedParts=function(modifier, partArray, value){
    var aux={};
    if(partArray.length==0){
        return value;
    }
    aux[partArray[0]]= getFormatedParts(modifier, partArray.slice(1), value);
    return aux;
}
