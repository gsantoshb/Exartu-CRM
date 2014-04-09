Meteor.startup(function(){
    if (!process.dType){
        dType={};
    }
    dType.validator={
        validateInsert: function(userId, doc){
            var types= dType.core.getObjTypes(doc);
            return _.every(types, function(type){
                if(type.customValidation){
                    return type.customValidation(doc);
                }
                // if type is not root I must call isValid(type,doc[subDocumentNameForThisType])
                return isValidObj(type, doc);
            })
        },
        validateUpdate: function(userId, doc, fieldNames, modifier, options){
            var baseType=dTypes.core.getObjBaseType(doc);
            return _.every(fieldNames, function(fieldName){
                return isValidUpdate(baseType, modifier.$set, fieldName)
            })
        }
    }
    var isValidObjUpdate= function(baseType, modifier){
        var formatedModifier=getFormatedModifier(modifier);
        return _.every(_.keys(formatedModifier), function(key){
            return isValidProperty(baseType, formatedModifier, key);
        })
    }
    var getFormatedModifier= function(modifier){
        var result ={};
        _.each(_.keys(modifier),function(key){
            var parts= key.split('.');
            result[parts[0]]= getFormatedParts(modifier, parts.slice(1), modifier[key]);
        })
        return result;
    }
    var getFormatedParts=function(modifier, partArray, value){
        var aux={};
        if(partArray.length==0){
            return value;
        }
        aux[partArray[0]]= getFormatedParts(modifier, partArray.slice(1), value);
        return aux;
    }


    var isValidUpdate= function(type, obj){
        return _.every(_.keys(obj), function(key){
            return isValidProperty(type, obj, key);
        })
    }
    // isValidObj and isValidObj2 do the same but with different approaches
    // this one loop throw the keys of the obj and use the isValidProperty
    // is recursive cuz is isValidProperty call isValidObj if the propName is a type
    var isValidObj= function(type, obj){
        return _.every(_.keys(obj), function(key){
            return isValidProperty(type, obj, key);
        })
    }
    var isValidProperty= function(type, obj, propName){
        var result;
        result=isField(type, propName);
        if (result){
            return isValidField(result, obj[propName]);
        }
        result=isService(type, propName);
        if (result){
            return result.isValid(obj[propName], result.setting)
        }
        result=isSubType(type, propName);
        if (result){
            return isValidObj(result, obj[propName]);
        }

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

    var isSubType= function(type, propName){
        var subType= dType.core.getObjType(propName);
        if (subType && (subType.parent == type.name)){
            return subType;
        }
    }

    // return true if the obj is a valid instance of type
    // assumes that obj is 'direct' instance of type, e.g. if  type is employee, obj must not be person (the parent type of employee),
    //  it must be the sub-document concerning to employee ('person[employee]' if you like)

    //  for each service if the obj has the property concerning to the service, it call the isValid hook,
    //      if not it call assign the return of service's defaultValue function into that property
    var isValidObject2 = function(type, obj){
        // Validating services
        //get the name, hooks, and setting for every service configured in this type
        var servicesObject=dType.core.getServices(type.services);

        if  (!_.every(servicesObject, function(service){
                if(obj[service.name] != undefined){
                   return servicesObject.isValid(obj[service.name], servicesObject.setting);
                }else{
                    obj[service.name]= service.defaultValue(servicesObject.setting);
                    return true;
                }
            }))
        {
            return false;
        }

        // Validating fields
        if  (!_.every(type.fields, function(field){
                if(obj[field.name] != undefined){
                    return isValidField(field, obj[field.name]);
                }else{
                    obj[service.name]= field.defaultValue;
                    return true;
                }
            }))
        {
            return false;
        }

        var relations= dType.core.getRelationsVisivilityOnType(type);

        // Validating Relations
        if  (!_.every(relations, function(relation){
            if(obj[relation.name] != undefined){
                return isValidRelation(relation, obj[relation.name]);
            }else{
                obj[relation.name]= relation.defaultValue;
                return true;
            }
        }))
        {
            return false;
        }

        return true;
    }


    var isValidField= function(field, value){
        switch (field.fieldType) {
            case Enums.fieldType.string:
                return value.match ? value.match(field.regex) != null : false;
            case Enums.fieldType.lookUp:
                if (field.multiple) {

                    if (typeof value != typeof[])
                        return false;
                    else {
                        var v = true;
                        _.every(value, function (val) {
                            var item = LookUps.findOne({
                                codeType: field.lookUpCode,
                                _id: val
                            });
                            if (! item)
                                v = false;
                            if (item.dependencies) {
                                if (_.difference(item.dependencies, value)) {
                                    console.error(item.name + ' dependencies fails');
                                    v = false;
                                }
                            }
                            return v;
                        })
                        return v;
                    }
                } else {
                    var item = LookUps.findOne({
                        codeType: field.lookUpCode,
                        _id: value
                    });
                    if (!item) {
                        return false;
                    }
                }

                return true;
            default:
            //todo integer, others
                return true;

        }
    }

    var isValidRelation= function(visibility, value){

        if (!checkCardinality(value, visibility.cardinality))
            return false;

        if (visibility.cardinality.max == 1) {
            //check if the value's type is the same as this relation's target (rel.obj2)
            return checkType(value, visibility.target);
        }
        else {
            //checking if all the values are correct
            return _.every(value, function (val) {
                return checkType(val, visibility.target);
            });
        }
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
        if (typeof obj == typeof {})
            return obj.type ? typeof obj.type == typeof[] ? obj.type.indexOf(typeName) >= 0 : false : false;
        else {

            var exists = collection.findOne({
                _id: obj,
                objNameArray: typeName
            }, {
                _id: 1
            });
            return exists != undefined;

        }
    }
});
