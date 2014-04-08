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
    var newObjType=dType.constructor.objType;

    var systemObjGroupTypes = [newObjType({
            collection: Contactables,
            objGroupType: Enums.objGroupType.contactable,
            name: 'contactable',
            services: ['messages', 'tasks', 'posts', 'tags']
        }),
        newObjType({
            collection: Jobs,
            name: 'job',
            objGroupType: Enums.objGroupType.job,
            services: ['messages', 'tasks', 'posts', 'tags'],
            fields: [{
                name: 'fee',
                displayName: 'Fee (%)',
                fieldType: Enums.fieldType.int
            }]
        })
    ]
    var systemObjTypes = [
        newObjType({
            objGroupType: Enums.objGroupType.contactable,
            parent: 'contactable',
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
                defaultValue: 'Primary'
            }, {
                name: 'description',
                displayName: 'Description'
            }]
        }),
        newObjType({
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
                displayName: 'Description'
            }]
        }),
        newObjType({
            objGroupType: Enums.objGroupType.contactable,
            objName: 'Employee',
            style: {
                icon: 'connection',
                color: 'blue'
            },
            defaultPersonType: Enums.personType.human,
            services: ['pastJobs','educations'],
            fields: [{
                name: 'description',
                displayName: 'Description'
            }]
        }),
        newObjType({
            objGroupType: Enums.objGroupType.job,
            objName: 'Direct Hire',
            style: {
                icon: 'briefcase',
                color: 'yellow'
            },
            services: [],
            fields: [{
                name: 'salary',
                displayName: 'Salary',
                fieldType: Enums.fieldType.int
              }, {
                name: 'jobTitle',
                displayName: 'Job title',
                fieldType: Enums.fieldType.lookUp,
                lookUpName: 'jobTitle',
                lookUpCode: Enums.lookUpTypes.job.titles.code
              }
            ]
        }),
        newObjType({
            objGroupType: Enums.objGroupType.job,
            objName: 'Temporary',
            style: {
                icon: 'briefcase',
                color: 'yellow'
            },
            services: [],
            fields: [{
                name: 'frequency',
                displayName: 'Frequency pay rate',
                fieldType: Enums.fieldType.lookUp,
                lookUpName: 'payRateFrequency',
                lookUpCode: Enums.lookUpTypes.payRate.frequencies.code
              }, {
                name: 'pay',
                displayName: 'Pay',
                fieldType: Enums.fieldType.int
              }
            ]
        })
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