/*
 * Add to system hierarchy the basic obj types
 * 	objGroupType Contactable contains:
 *    - objType Customer
 *    - objType Employee
 *    - objType Contact
 *  Job:
 *    - objType Direct Hire
 *    - objType Temporary
 */
seedSystemObjTypes = function () {
    var systemObjGroupTypes = [
        {
            objGroupType: Enums.objGroupType.contactable,
            services: ['messages', 'tasks', 'posts', 'tags'],
            fields: [
                {
                    name: 'AllContactablesUseThisField',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                }]
        },
        {
            objGroupType: Enums.objGroupType.job,
            services: ['messages', 'tasks', 'posts', 'tags'],
            fields: []
        },
        {
            objGroupType: Enums.objGroupType.quote,
            services: ['messages', 'tasks', 'posts', 'tags'],
            fields: [
                {
                    name: 'Quote_Name',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },                {
                    name: 'Quote_Description',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Deal',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                },
                {
                    name: 'Statuses',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                }
            ]

        },
        {
            objGroupType: Enums.objGroupType.deal,
            services: ['messages', 'tasks', 'posts', 'tags','quotes'],
            fields: [
                {
                    name: 'Deal_Name',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Deal_Description',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Competition',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Customer',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                },
                {
                    name: 'Statuses',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                },
                {
                    name: 'Revenue_Potential',
                    regex: '.*',
                    fieldType: Enums.fieldType.int,
                    defaultValue: 0,
                    showInAdd: false
                },
                {
                    name: 'Estimated_Close_Date',
                    regex: '.*',
                    fieldType: Enums.fieldType.date,
                    defaultValue: '',
                    showInAdd: false
                }
            ]
        }
    ]
    var systemObjTypes =
     [
        {
            objGroupType: Enums.objGroupType.contactable,
            objName: 'Customer',
            style: {
                icon: 'build',
                color: 'red'
            },
            defaultPersonType: Enums.personType.organization,
            services: [],
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
                icon: 'contact',
                color: 'red'
            },
            defaultPersonType: Enums.personType.human,
            services: [],
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
            services: [],
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
            services: [],
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
            services: [],
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
        },
        {
            objGroupType: Enums.objGroupType.deal,
            objName: 'Funding Deal',
            style: {
                icon: 'briefcase',
                color: 'yellow'
            },
            services: [],
            fields: [{
                name: 'Estimated_Revenue',
                regex: '.*',
                fieldType: Enums.fieldType.string,
                defaultValue: '',
                showInAdd: true
            },
                {
                    name: 'Credential_Check',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                },
            ]
        },
        {
            objGroupType: Enums.objGroupType.deal,
            objName: 'Software Deal',
            style: {
                icon: 'briefcase',
                color: 'yellow'
            },
            services: [],
            fields: [{
                name: 'User_Count',
                regex: '.*',
                fieldType: Enums.fieldType.string,
                defaultValue: '',
                showInAdd: true
            },
                {
                    name: 'Modules_Note',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },   ]
        }
    ];
    _.forEach(systemObjTypes, function (objtype) {
        var oldObjType = ObjTypes.findOne({
            objName: objtype.objName
        });

        //
        // fields
        //
        var fields = objtype.fields;
        var objGroupType = _.find(systemObjGroupTypes, function(objgroup) { return objgroup.objGroupType==objtype.objGroupType});
        if (objGroupType)  fields=objGroupType.fields.concat(fields);

        //
        // services
        //
        var services = objtype.services;
        if (objGroupType)  services=objGroupType.services.concat(services);
        if (oldObjType == null) {
            ObjTypes.insert({
                hierId: ExartuConfig.SystemHierarchyId,
                objGroupType: objtype.objGroupType,
                objName: objtype.objName,
                services: services,
                fields: fields,
                personType: objtype.defaultPersonType,
                style: objtype.style
            })
        } else {
            //console.log('updating objType ' + objtype.objName);
            ObjTypes.update({
                _id: oldObjType._id
            }, {
                $set: {
                    services: services,
                    fields: fields,
                    style: objtype.style
                }
            })
        }
    });

}