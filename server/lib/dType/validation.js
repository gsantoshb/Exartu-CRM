if (!process.dType){
    dType={};
}
dType.validation={
    validateUpdate: function(){},
    validateInsert: function(userId, doc){
        var types= dType.core.getObjTypes(doc);
        return _.every(types, function(type){
            if(type.customValidation){
                return type.customValidation(type);
            }
            // if type is not root I must call isValid(type,doc[subDocumentNameForThisType])
            return isValid(type, doc);
        })

        //where make the validation of the relations? here or inside the isValid function?


    }
}

// return true if the obj is a valid instance of type
// assumes that obj is 'direct' instance of type, e.g. if  type is employee, obj must not be person (the parent type of employee),
//  it must be the sub-document concerning to employee ('person[employee]' if you like)

//  for each service if the obj has the property concerning to the service, it call the isValid hook,
//      if not it call assign the return of service's defaultValue function into that property
isValid= function(type, obj){

    // Validating services
    //get the name, hooks, and config for every service configured in this type
    var servicesObject=dType.core.getServices(type.services);

    if  (!_.every(servicesObject, function(service){
            if(obj[service.name] != undefined){
               return servicesObject.isValid(obj[service.name], servicesObject.config);
            }else{
                obj[service.name]= service.defaultValue(servicesObject.config);
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

    var relations= dType.core.getTypeRelations(type);

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

}

var isValidRelation= function(relation, value){

}

