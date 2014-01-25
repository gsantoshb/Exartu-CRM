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

validateObjType = function (obj, objType) {
    if (!objType) {
        console.error('Obj type does not exist');
        return false;
    }
    console.log('obj1',obj);
    console.log('objtype1',objType);
    console.log('objindexof',obj.type.indexOf(objType.name));
    if (obj.type.indexOf(objType.name) < 0) {
        console.error('Objtype incorrect');
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
    var objTypeFields = obj[objType.name];
    v = true;
    _.every(objType.fields, function (field) {
        if (objTypeFields[field.name] != undefined) {
            v = v && (objTypeFields[field.name].match(field.regex) != null);
            if (!v) console.error(field.name + ' is invalid: ' + v);
            return v;
        } else {
            v = false;
            console.error(field.name + ' does not exist');
            return false;
        }
    });
    if (!v) {
        console.error('invalid fields');
        return false;
    }

    // Validating relations
    var relations = Relations.find({
        $or: [{
            obj1: objType.name
  }, {
            obj2: objType.name
  }]
    }).fetch();
    _.forEach(relations, function (rel) {
        var objRel = objType.name == rel.obj1 ? rel.visibilityOn1 : rel.visibilityOn2;
        console.log('checking :' + rel.name);
        if (objTypeFields[objRel.name] != undefined) {
            //hack
            var oldObjTypeFields = Contactables.findOne({
                _id: obj._id
            })[objType.name];

            v = v && beforeUpdateRelation(obj, rel, objRel.name, objTypeFields, oldObjTypeFields);
            if (!v) console.error(rel.name + ' is invalid: ' + v);
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
 * Services available in the system
 */
SystemServices = ['messages ', 'documents ', 'pastJobs ', 'tags ', 'education ', 'task '];

Meteor.startup(function () {
    Meteor.methods({
//        createObjType: function (type, name, services, fields) {
//            // validate type
//            if (!_.contains(Enums.objGroups, type)) {
//                console.error('create objType: objGroup does not exist')
//                return null;
//            }
//
//            // validate name
//            if (!(typeof name == 'string' || name instanceof String)) {
//                console.error('create objType: objType name is not a string')
//                return null;
//            }
//
//            if (ObjTypes.findOne({
//                name: name
//            }) != null) {
//                console.error('create objType: objType name is already used');
//                return null;
//            }
//
//            // validate services
//            var v = true;
//            if (Obj.prototype.toString.call(services) === '[obj Array]')
//                _.every(services, function (service) {
//                    if (!_.contains(SystemServices, service)) {
//                        v = false;
//                        console.error('create objType: service does not exist');
//                        return false;
//                    }
//                    return true;
//                });
//            else {
//                console.error('create objType: objType services is not an array')
//                return null;
//            }
//
//            // validate fields
//            if (Obj.prototype.toString.call(fields) === '[obj Array]')
//                _.every(fields, function (field) {
//                    if (!(typeof field.name == 'string' || field.name instanceof String)) {
//                        console.log('create objType: field name invalid --> ' + field.name);
//                        v = false;
//                        return false;
//                    }
//                    if (!(typeof field.showInAdd == 'boolean')) {
//                        console.log('create objType: field showInAdd invalid --> ' + field.name);
//                        v = false;
//                        return false;
//                    }
//                    // TODO: validate regex, type and default value
//                });
//            else {
//                console.error('create objType: objType fields is not an array')
//                return null;
//            }
//
//            return ObjTypes.insert({
//                hierId: Meteor.user().hierId,
//                type: type,
//                name: name,
//                services: services,
//                fields: fields,
//            })
//        },
        getObjType: function (id) {
            return ObjTypes.findOne({
                _id: id
            });
        },
        getContactableTypes: function () {
            return ObjTypes.find({
                objGroupType: Enums.objGroups.contactable
            }).fetch();
        },
        getJobTypes: function () {
            return ObjTypes.find({
                objGroupType: Enums.objGroups.job
            }).fetch();
        }
    });
});