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
var newObjType=dType.constructor.objType;
newObjType({
    collection: Contactables,
    objGroupType: Enums.objGroupType.contactable,
    name: 'contactable',
    services: ['messages', 'tasks', 'posts', 'tags']
});
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
});

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
});
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
});
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
})
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
})
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
});