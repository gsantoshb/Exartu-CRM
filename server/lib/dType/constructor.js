if (!process.dType){
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
        fieldType: options.fieldType || Enums.fieldType.string,
        fieldGroup: options.fieldGroup || 'defaultGroup',
        showInAdd: true,
        customValidation: options.customValidation || null
    }
    field.defaultValue= dType.fieldTypes.defaultVal[field.fieldType];

    if(field.fieldType==Enums.fieldType.string){
        field.regex= options.regex || '.*';
    }
    if(field.fieldType == Enums.fieldType.lookUp){
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

    var service= {
        name: options.name,
        getSettings: options.constructor || function(){return {name: options.name}; },
        insert: options.insert || function(){ return true},
        update: options.update || function(){ return true}
    }

    //where store services?
    return service;
};

dType.constructor.objType=function(options){
    var objType={
        fields: [],
        services: []
    }

    if (options.parent){
        var parent= dType.core.getObjType(options.parent);
        if (parent){
            //what data of my parent do i need?
        }
    }


    _.each(options.fields || [],function(field){
        objType.fields.push(dType.constructor.field(field))
    })
    _.each(options.services || [],function(service){
        objType.services.push(dType.constructor.service(service))
    })

    if (options.collection){
        //check if the collection already is hooked?
        options.collection.before.update(dType.validation.validateUpdate);
        options.collection.before.insert(dType.validation.validateInsert);

    }

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
    dType.core.createRelation(relation);
    return relation;
};