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
            objGroupType: Enums.objGroupType.job
        },
        {
            objGroupType: Enums.objGroupType.deal,
            fields: [
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
                    showInAdd: true
                },
                {
                    name: 'Estimated_Close_Date',
                    regex: '.*',
                    fieldType: Enums.fieldType.date,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Deal_Description',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
                    defaultValue: '',
                    showInAdd: false
                }
            ]},
            {
            objGroupType: Enums.objGroupType.deal,
            fields: [
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
                    showInAdd: true
                },
                {
                    name: 'Estimated_Close_Date',
                    regex: '.*',
                    fieldType: Enums.fieldType.date,
                    defaultValue: '',
                    showInAdd: true
                },
                {
                    name: 'Deal_Description',
                    regex: '.*',
                    fieldType: Enums.fieldType.string,
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
				color: 'red'
			},
			defaultPersonType: Enums.personType.organization,
			services: ['messages', 'tasks', 'posts', 'tags'],
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
			services: ['messages', 'tasks', 'posts', 'tags'],
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
			services: ['messages', 'tasks', 'posts', 'tags'],
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
                name: 'JobTitle',
                regex: '',
                fieldType: Enums.fieldType.lookUp,
                lookUpName: 'dealTitle',
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
            services: ['messages', 'tasks'],
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
                showInAdd: true
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
            services: ['messages', 'tasks'],
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
        var fields = objtype.fields;
        var objGroupType = _.find(systemObjGroupTypes, function(objgroup) { return objgroup.objGroupType==objtype.objGroupType});

        if (objGroupType)  fields=fields.concat(objGroupType.fields);
        //console.log('fields',objtype.objName,fields);

		if (oldObjType == null) {
			//console.log('inserting objType ' + objtype.objName);
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
			//console.log('updating objType ' + objtype.objName);
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