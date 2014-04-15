if (!dType){
    dType={};
}
/*
 * The constructor module provides an interface to define or modify dTypes
 */

//create and return a field
//      options = {
//          name: string (required)
//          displayName: string default= options.name
//          fieldType: Enums.fieldType default= string
//          defaultValue: see dType.fieldTypes.defaultVal default depend on options.fieldType
//          showInAdd: boolean default= true
//          fieldGroup: any js type, default='defaultGroup'
//          customValidation: js function, default=null
//
//******* for string fieldType
//          regex: must be a string NOT A REGEX, default = '.*'
//
//******* for lookup fieldType
//          lookUpName:
//          lookUpCode:
//          multiple:   default=false
//      }
dType.constructor.field= function(options){

   var field= {
        name: options.name,
        displayName: options.displayName || options.name,
        fieldType: options.fieldType || dType.fieldTypes.string,
        fieldGroup: options.fieldGroup || 'defaultGroup',
        showInAdd: true,
        customValidation: options.customValidation || null
    }
    field.defaultValue= dType.fieldTypes.defaultVal[field.fieldType];

    if(field.fieldType==dType.fieldTypes.string){
        field.regex= options.regex || '.*';
    }
    if(field.fieldType == dType.fieldTypes.lookUp){
        field.lookUpName= options.lookUpName;
        field.lookUpCode= options.lookUpCode;
        field.multiple= options.multiple || false
    }
    return field;
};

// create and register a service
//      options = {
//          name: string (required)
//          constructor: string default= options.name
//          insert: Enums.fieldType default= string
//          update: see dType.fieldTypes.defaultVal default depend on options.fieldType
//
//      }
dType.constructor.service=function(options){
    var returnTrueFunction=function(){
     return true;
    };
    var service= {
        name: options.name,
        getSettings: options.getSettings || function(){return {name: options.name}; },
        isValid: options.isValid ||returnTrueFunction,
        insert: options.insert || returnTrueFunction,
        update: options.update || returnTrueFunction
    }
    dType.core.createService(service);
    return service;
};

dType.constructor.objType=function(options){
    var objType={
        fields: [],
        services: [],
        name: options.name
    }
    if (options.collection){
        objType.collection=options.collection
    }else if (options.parent){
        objType.parent=options.collection
    }
//        if (options.parent){
//          var parent= dType.core.getObjType(options.parent);
//          if (parent){
//              what data of my parent do i need?
//          }
//        }


    _.each(options.fields || [],function(field){
        objType.fields.push(dType.constructor.field(field))
    })
    _.each(options.services || [],function(service){
        var name = _.isString(service) ? service : service.name;
        var options = _.isString(service) ? {} : service.options;
        var service= dType.core.getService(name);
        if (service){
            objType.services.push(service.getSettings(options));
        }
    })

    dType.core.createObjType(objType);
    return objType;
};

dType.constructor.relation=function (options){
    var relation = {
        name: options.name,
        obj1: options.obj1,
        obj2: options.obj2,
        visibilityOn1: options.visibilityOn1,
        visibilityOn2: options.visibilityOn2
    };
    var getDefault=function(cardinality){
        return cardinality.max == 1 ? null: [];
    }
    relation.visibilityOn1.target= relation.obj2;
    relation.visibilityOn1.defaultValue= relation.visibilityOn1.defaultValue || getDefault(relation.visibilityOn1.cardinality);
    relation.visibilityOn1.showInAdd= !(_.isUndefined(relation.visibilityOn1.showInAdd)) ? relation.visibilityOn1.showInAdd : true;

    relation.visibilityOn2.target=relation.obj1;
    relation.visibilityOn2.defaultValue=relation.visibilityOn2.defaultValue || getDefault(relation.visibilityOn2.cardinality);
    relation.visibilityOn2.showInAdd= !(_.isUndefined(relation.visibilityOn2.showInAdd)) ? relation.visibilityOn2.showInAdd : true;

    dType.core.createRelation(relation);
    return relation;
};