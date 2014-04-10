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
            fields: []
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
                }, {
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
            services: ['messages', 'tasks', 'posts', 'tags', 'quotes'],
            fields: [
                {
                    name: 'Deal_Name',
                    displayName: 'Name',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Deal_Description',
                    displayName: 'Description',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Competition',
                    displayName: 'Competition',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Customer',
                    displayName: 'Customer',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                },
                {
                    name: 'Statuses',
                    displayName: 'Statuses',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                },
                {
                    name: 'Revenue_Potential',
                    displayName: 'Revenue potential',
                    regex: '.*',
                    fieldType: Enums.fieldType.int,
                    defaultValue: 0,
                    showInAdd: false
                },
                {
                    name: 'Estimated_Close_Date',
                    displayName: 'Estimated close date',
                    regex: '.*',
                    fieldType: Enums.fieldType.date,
                    defaultValue: '',
                    showInAdd: false
                }
            ]
        }
    ]
    var systemObjTypes = [
        {
            objGroupType: Enums.objGroupType.contactable,
            objName: 'Customer',
            style: {
                icon: 'build',
                color: 'blue'
            },
            defaultPersonType: Enums.personType.organization,
            services: [],
            fields: [{
                name: 'department',
                displayName: 'Deparment',
                regex: '.',
                fieldType: Enums.fieldType.string,
                defaultValue: 'Primary',
                showInAdd: true
            }, {
                name: 'description',
                displayName: 'Description',
                regex: '.*',
                fieldType: Enums.fieldType.string,
                defaultValue: '',
                showInAdd: true
            }]
        },
        {
            objGroupType: Enums.objGroupType.contactable,
            objName: 'Contact',
            style: {
                icon: 'contact',
                color: 'blue'
            },
            defaultPersonType: Enums.personType.human,
            services: [],
            fields: [{
                name: 'description',
                displayName: 'Description',
                regex: '.*',
                fieldType: Enums.fieldType.string,
                defaultValue: '',
                showInAdd: true
            }]
        },
        {
            objGroupType: Enums.objGroupType.contactable,
            objName: 'Employee',
            style: {
                icon: 'connection',
                color: 'blue'
            },
            defaultPersonType: Enums.personType.human,
            services: ['pastJobs'],
            fields: [{
                name: 'description',
                displayName: 'Description',
                regex: '.*',
                fieldType: Enums.fieldType.string,
                defaultValue: '',
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
                displayName: 'Job title',
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
              name: 'jobTitle',
              displayName: 'Job title',
              regex: '',
              fieldType: Enums.fieldType.lookUp,
              lookUpName: 'jobTitle',
              multiple: false,
              defaultValue: null,
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
            fields: [
                {
                    name: 'Estimated_Revenue',
                    displayName: 'Estimated revenue',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Credential_Check',
                    displayName: 'Credential check',
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
                    displayName: 'User count',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Modules_Note',
                    displayName: 'Modules note',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: true
                },
            ]
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
        var objGroupType = _.find(systemObjGroupTypes, function (objgroup) {
            return objgroup.objGroupType == objtype.objGroupType
        });
        if (objGroupType) fields = objGroupType.fields.concat(fields);

        //
        // services
        //
        var services = objtype.services;
        if (objGroupType) services = objGroupType.services.concat(services);
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