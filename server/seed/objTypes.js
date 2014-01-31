seedSystemObjTypes = function () {
    var systemObjTypes = [
        {
            objGroupType: Enums.objGroupType.contactable,
            objName: 'Customer',
            style: {
                icon: 'build',
                color: 'red'
            },
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
            objGroupType: Enums.objGroupType.contactable,
            objName: 'Contact',
            style: {
                icon: 'build',
                color: 'red'
            },
            defaultPersonType: Enums.personType.human,
            services: ['messages', 'tasks'],
            fields: []
            },
        {
            objGroupType: Enums.objGroupType.contactable,
            objName: 'Employee',
            style: {
                icon: 'connection',
                color: 'pink'
            },
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
                }, {
                name: 'statuses',
                regex: '',
                fieldType: Enums.fieldType.lookUp,
                lookUpName: 'employeeStatuses',
                multiple: true,
                defaultValue: [],
                showInAdd: true
                }]
            },
        {
            objGroupType: Enums.objGroupType.job,
            objName: 'Direct Hire',
            style: {
                icon: 'briefcase',
                color: 'yellow'
            },
            services: ['messages', 'tasks'],
            fields: [{
                name: 'jobTitle',
                regex: '',
                fieldType: Enums.fieldType.lookUp,
                lookUpName: 'jobTitle',
                multiple: false,
                defaultValue: null,
                showInAdd: true
                }]
            },
        {
            objGroupType: Enums.objGroupType.job,
            objName: 'Temporary',
            style: {
                icon: 'briefcase',
                color: 'yellow'
            },
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
        var oldObjType = ObjTypes.findOne({
            objName: objtype.objName
        });
        if (oldObjType == null) {
            console.log('inserting objType ' + objtype.objName);
            ObjTypes.insert({
                hierId: ExartuConfig.SystemHierarchyId,
                objGroupType: objtype.objGroupType,
                objName: objtype.objName,
                services: objtype.services,
                fields: objtype.fields,
                personType: objtype.defaultPersonType,
                style: objtype.style
            })
        } else {
            console.log('updating objType ' + objtype.objName);
            ObjTypes.update({
                _id: oldObjType._id
            }, {
                $set: {
                    services: objtype.services,
                    fields: objtype.fields,
                    style: objtype.style
                }
            })
        }
    });

}