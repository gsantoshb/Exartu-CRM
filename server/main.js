var dbSeed = {
    /*
     * Add to system hierarchy the basic object types
     * 	Contactable:
     *    - Customer
     *    - Employee
     *    - Contact
     *  Job:
     *    - Permanent
     *    - Temporal
     */
    seedSystemObjTypes: function () {
        var systemObjTypes = [
            {
                type: Enums.objectGroups.contactable,
                name: 'Customer',
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'department',
                    regex: '.',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true,
                    }, {
                    name: 'test2',
                    regex: '.*',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false,
                }],
            },
            {
                type: Enums.objectGroups.contactable,
                name: 'CustomerContact',
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'test',
                    regex: '^(([1-9][0-9]*|[0-9])(.[0-9]*|))$',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '^[a-z0-9].$',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                }],
            },
            {
                type: Enums.objectGroups.contactable,
                name: 'Employee',
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'test',
                    regex: '.*',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '.*',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                }]
            },
            {
                type: Enums.objectGroups.job,
                name: 'Permanent',
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'test',
                    regex: '.*',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '.*',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                }]
            },
            {
                type: Enums.objectGroups.job,
                name: 'Temporal',
                services: ['messages', 'tasks'],
                fields: [{
                    name: 'Type',
                    regex: '.*',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                    }, {
                    name: 'test2',
                    regex: '.*',
                    type: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                }]
            }
        ];

        _.forEach(systemObjTypes, function (objType) {
            var type = ObjectTypes.findOne({
                name: objType.name
            });
            if (type == null) {
                ObjectTypes.insert({
                    hierId: ExartuConfig.SystemHierarchyId,
                    type: objType.type,
                    name: objType.name,
                    services: objType.services,
                    fields: objType.fields,
                })
            } else {
                ObjectTypes.update({
                    _id: type._id
                }, {
                    $set: {
                        services: objType.services,
                        fields: objType.fields,
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