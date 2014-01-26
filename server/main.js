var dbSeed = {
    /*
     * Add to system hierarchy the basic obj types
     * 	objGroup Contactable contains:
     *    - objType Customer
     *    - objType Employee
     *    - objType Contact
     *  Job:
     *    - objType Direct Hire
     *    - objType Temporary
     */
    seedSystemObjTypes: function () {
        var systemObjTypes = [
            {
                objGroup: Enums.objGroupType.contactable,
                objName: 'Customer',
                defaultPersonType: Enums.personType.organization,
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'department',
                    regex: '.',
                    fieldType: Enums.fieldType.string,
                    defaultValue: 'Primary',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                }]
            },
            {
                objGroup: Enums.objGroupType.contactable,
                objName: 'CustomerContact',
                defaultPersonType: Enums.personType.human,
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'test',
                    regex: '^(([1-9][0-9]*|[0-9])(.[0-9]*|))$',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '^[a-z0-9].$',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                }]
            },
            {
                objGroup: Enums.objGroupType.contactable,
                objName: 'Employee',
                defaultPersonType: Enums.personType.human,
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'test',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                }]
            },
            {
                objGroup: Enums.objGroupType.job,
                objName: 'Direct Hire',
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'test',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                }]
            },
            {
                objGroup: Enums.objGroupType.job,
                objName: 'Temporary',
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'Type',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                }]
            }
        ];

        _.forEach(systemObjTypes, function (objtype) {
            var objName = ObjTypes.findOne({
                objName: objtype.objName
            });
            if (objName == null) {
                ObjTypes.insert({
                    hierId: ExartuConfig.SystemHierarchyId,
                    objGroup: objtype.objGroup,
                    objName: objtype.objName,
                    services: objtype.services,
                    fields: objtype.fields,
                    personType: objtype.defaultPersonType
                })
            } else {
                ObjTypes.update({
                    _id: objtype._id
                }, {
                    $set: {
                        services: objtype.services,
                        fields: objtype.fields,
                    }
                })
            }
        });
    },
    seedSystemRelations: function () {
        var systemRelations = [
            {
                name: 'CustomerContacts',
                obj1: 'CustomerContacts',
                obj2: 'Customer',
                visibilityOn1: {
                    name: 'customer',
                    collection: 'Contactables',
                    defaultValue: null,
                    cardinality: {
                        min: 0,
                        max: 1
                    },
                },
                visibilityOn2: {
                    name: 'contacts',
                    collection: 'Contactables',
                    defaultValue: [],
                    cardinality: {
                        min: 0,
                        max: Infinity
                    },
                },
                cascadeDelete: false,
            },
            {
                name: 'asd',
                obj1: 'Employee',
                obj2: 'Customer',
                visibilityOn1: {
                    name: 'asdEmp',
                    collection: 'Contactables',
                    defaultValue: null,
                    cardinality: {
                        min: 0,
                        max: 1
                    },
                },
                visibilityOn2: {
                    name: 'asdCus',
                    collection: 'Contactables',
                    defaultValue: null,
                    cardinality: {
                        min: 0,
                        max: 1
                    },
                },
                cascadeDelete: false,
            },
        ];

        _.forEach(systemRelations, function (rel) {
            var oldRel = Relations.findOne({
                name: rel.name
            });
            if (oldRel == null) {
                rel.hierId = ExartuConfig.SystemHierarchyId;
                console.dir(rel);
                Relations.insert(rel);
            } else {
                Relations.update({
                    _id: oldRel._id
                }, {
                    $set: {
                        visibilityOn1: rel.visibilityOn1,
                        visibilityOn2: rel.visibilityOn2,
                        cascadeDelete: rel.cascadeDelete
                    }
                })
            }
        });
    }
}

Meteor.startup(function () {
    /*
     * Seed database
     * Execute all function defined in seedSystemObjTypes
     */
    _.forEach(dbSeed, function (seedFn) {
        seedFn.call();
    })
});