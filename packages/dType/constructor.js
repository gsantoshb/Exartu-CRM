if (!dType) {
    dType = {};
}
/*
 * The constructor module provides an interface to define or modify dTypes
 */


dType.constructor.fieldType = function (options) {
    var fieldType = {
        name: options.name,
        validate: options.validate,
        defaultValue: options.defaultValue
    }
    dType.core.createFieldType(fieldType);
}

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
dType.constructor.field = function (options) {

    if (options.fieldType && !dType.core.getFieldType(options.fieldType))
        throw new Error('the field type ' + options.fieldType + ' does not exists');
    var field = options
//    debugger;
    field.name= options.name;
    field.displayName= options.displayName || options.name;
    field.fieldType= options.fieldType || 'string';
    field.fieldGroup= options.fieldGroup || 'defaultGroup';
    field.showInAdd= true;

    field.defaultValue = options.defaultValue || dType.core.getFieldType(options.fieldType).defaultValue;

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
dType.constructor.service = function (options) {
    var returnTrueFunction = function () {
        return true;
    };
    var service = {
        name: options.name,
        getSettings: options.getSettings || function () {
            return {name: options.name};
        },
        isValid: options.isValid || returnTrueFunction,
        initValue: options.initValue,
        insert: options.insert || returnTrueFunction,
        update: options.update || returnTrueFunction
    }
    dType.core.createService(service);
    return service;
};

dType.constructor.objType = function (options) {
    var objType = _.clone(options);
    if(! options.collection && ! options.parent){
        throw new Error('the ObjType ' + options.name + ' has no collection and no parent, you must specify one')
    }
//    if (options.collection) {
//        objType.collection = options.collection
//    } else if (options.parent) {
//        objType.parent = options.parent
//    }
    objType.fields=[];
    _.each(options.fields || [], function (field) {
        objType.fields.push(dType.constructor.field(field))
    })

    objType.services=[];
    if(options.services){
        _.each(options.services, function (service) {
            var name = _.isString(service) ? service : service.name;
            var options = _.isString(service) ? {} : service.options;
            var service = dType.core.getService(name);
            if (service) {
                objType.services.push(service.getSettings(options));
            }else{
                throw new Error('the service ' + name + ' does not exists')
            }
        })
    }

    dType.core.createObjType(objType);
    return objType;
};

dType.constructor.relation = function (options) {
    var relation = {
        name: options.name,
        obj1: options.obj1,
        obj2: options.obj2,
        visibilityOn1: options.visibilityOn1,
        visibilityOn2: options.visibilityOn2
    };

    extendVisiblity(relation.visibilityOn1, relation.obj2);

    extendVisiblity(relation.visibilityOn2, relation.obj1);

    dType.core.createRelation(relation);
    return relation;
};

var extendVisiblity = function (visibility, target) {
    visibility.target = visibility.target || target;
    visibility.collection = dType.core.getCollectionOfType(target)._collection._dtypeId;

    visibility.defaultValue = visibility.defaultValue || getDefault(visibility.cardinality);
    visibility.showInAdd = !(_.isUndefined(visibility.showInAdd)) ? visibility.showInAdd : true;
}
var getDefault = function (cardinality) {
    return cardinality.max == 1 ? null : [];
}