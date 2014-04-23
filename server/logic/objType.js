/*
 * Validate if an obj has the structure required by the objType.
 * Return true if:
 *  - objTypeId is valid
 *  - obj has an obj with name equal to objType.name
 *  - obj[objType.name] has every field defined in objType.fields
 *  - obj has an obj for every service defined in objType.services
 * Params:
 *	- obj: entity that is validated (e.g.: contactable).
 *  - objTypeId: Id of type used to validated the obj (obj)
 */
Meteor.publish('objTypes', function () {
    return ObjTypes.find();
})

validateObjType = function (obj, objType) {
    if (!objType) {
        console.error('Obj type does not exist');
        return false;
    }

    // Validating services
    var v = true;
    _.every(SystemServices, function (service) {
        var needed = objType.services.indexOf(service) >= 0;
        var used = obj[service] ? true : false;

        v = ((needed && used) || (!needed && !used));
        return v;
    });
    if (!v) {
        console.error('invalid service');
        return false;
    }

    // Validating fields
    var objTypeFields = obj[objType.objName];
    //    console.dir(obj);
    //    console.log(objType.objName);
    v = true;
    _.every(objType.fields, function (field) {
        if (objTypeFields[field.name] != undefined) {
            v = validateField(objTypeFields[field.name], field);
            if (!v) console.error(field.name + ' is invalid: ' + v);
            return v;
        } else {
            objTypeFields[field.name] = field.defailtValue;
            return true;
        }
    });
    if (!v) {
        console.error('invalid fields');
        return false;
    }

    // Validating relations
    var relations = Relations.find({
        $or: [
            {
                obj1: objType.objName
            }, {
                $and: [
                    {
                        obj2: objType.objName
                    }, {
                        visibilityOn2 : {
                            $exists: true
                        }
                    }
                ]
            }, {
                'visibilityOn2.isGroupType': true,
                obj1: objType.objGroupType
            }, {
                $and: [
                    {
                        obj2: objType.objGroupType
                    }, {
                        visibilityOn2: {
                            $exists: true
                        }
                    }
                ]
            }
        ]
    }).fetch();

    //    console.log('relations...');
    //    console.dir(relations);
    _.forEach(relations, function (rel) {

        var objRel = (objType.objName == rel.obj1 || objType.objGroupType == rel.obj1) ? rel.visibilityOn1 : rel.visibilityOn2;
        //        console.info('rel')
        //        console.dir(rel);
        objTypeFields = objRel.isGroupType ? obj : objTypeFields;
        console.log('checking: ' + rel.name + ' in ' + objType.objName);
        //        console.dir(objTypeFields);
        //        console.log(objRel.name);
        //        console.dir(objTypeFields[objRel.name])
        if (objTypeFields[objRel.name] !== undefined) {

            console.info('calling beforeUpdateRelation');
            v = v && beforeUpdateRelation(obj, rel, objType.objName);
            if (!v) console.error(rel.name + ' is invalid: ');
        } else {
            objTypeFields[objRel.name] = objRel.defaultValue;
        }
    });
    if (!v) {
        console.error('invalid relations');
        return false;
    }

    return true;
}
/*
 * validate a field depending on the type
 * not complited
 */
var validateField = function (value, field) {
    switch (field.fieldType) {
    case Enums.fieldType.string:
        return value.match ? value.match(field.regex) != null : false;
    case Enums.fieldType.lookUp:
        debugger;
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
//                    var item = _.findWhere(lookUp.items, {
//                        code: val
//                    });
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
//            var item = _.findWhere(lookUp.items, {
//                code: value
//            });
            if (!item) {
                return false;
            }
        }

        return true;
    default: // integer, others
        return true;

    }
}
/*
 * Services available in the system
 */
SystemServices = ['messages', 'documents', 'pastJobs', 'tags', 'education', 'tasks', 'posts'];

Meteor.startup(function () {
    Meteor.methods({
        getObjType: function (id) {
            return ObjTypes.findOne({
                _id: id
            });
        },
        getContactableTypes: function () {
            return ObjTypes.find({
                objGroupType: Enums.objGroupType.contactable
            }).fetch();
        },
        getJobTypes: function () {
            return ObjTypes.find({
                objGroupType: Enums.objGroupType.job
            }).fetch();
        },
        getDealTypes: function () {
            return ObjTypes.find({
                objGroupType: Enums.objGroupType.deal
            }).fetch();
        }
    });
});
