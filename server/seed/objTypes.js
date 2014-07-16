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
var newObjType = dType.constructor.objType;
var getFirst = function (code) {
  var first = LookUps.findOne({ codeType: code});
  return first ? first._id : null
}
newObjType({
  collection: Contactables,
  objGroupType: Enums.objGroupType.contactable,
  name: 'contactable',
  services: ['messages', 'tasks', 'notes', 'tags', 'contactMethods']
});

newObjType({
  name: 'person',
  services: [],
  fields: [
    {
      name: 'firstName',
      displayName: 'First name',
      required: true
    },
    {
      name: 'lastName',
      displayName: 'Last name',
      required: true
    },
    {
      name: 'middleName',
      displayName: 'Middle name'
    },
    {
      name: 'jobTitle',
      displayName: 'Job title'
    },
    {
      name: 'salutation',
      displayName: 'Salutation',
        showInAdd: false,
        required: false
    }
  ]
});
newObjType({
  name: 'organization',
  services: [],
  fields: [
    {
      name: 'organizationName',
      displayName: 'Organization name',
      required: true
    }
  ]
});

newObjType({
    collection: Jobs,
    name: 'job',
    objGroupType: Enums.objGroupType.job,
    services: ['messages', 'tasks', 'notes', 'tags', 'candidates', 'jobRates'],
    fields: [{
        name: 'publicJobTitle',
        displayName: 'Public job title',
        required: false
    },{
        name: 'statusNote',
        displayName: 'Status Note',
        required: false
    },{
        name: 'jobDescription',
        displayName: 'Job Description',
        required: false
    },{
        name: 'startDate',
        displayName: 'Start date',
        fieldType: 'date',
        defaultValue: null,
        required: true
    },{
        name: 'endDate',
        displayName: 'End date',
        fieldType: 'date',
        defaultValue: null,
        required: false
    },
    {
      name: 'duration',
      displayName: 'Duration',
      fieldType: 'lookUp',
      lookUpName: 'jobDuration',
      lookUpCode: Enums.lookUpTypes.job.duration.code,
      defaultValue: getFirst(Enums.lookUpTypes.job.duration.code),
      required: true,
      multiple: false
    },
    { name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'jobStatus',
      lookUpCode: Enums.lookUpTypes.job.status.code,
      required: true,
      lookUpName: 'jobTitle',
      multiple: false,
      defaultValue: getFirst(Enums.lookUpTypes.job.status.code)
    }
//    {
//      name: 'industry',
//      displayName: 'Industry',
//      fieldType: 'lookUp',
//      lookUpName: 'jobIndustry',
//      lookUpCode: Enums.lookUpTypes.job.industry.code,
//      required: false,
//      lookUpName: 'jobTitle',
//      multiple: false,
//      showInAdd: false,
//      defaultValue: getFirst(Enums.lookUpTypes.job.industry.code)
//    },
//    {
//      name: 'category',
//      displayName: 'Category',
//      fieldType: 'lookUp',
//      lookUpName: 'jobCategory',
//      lookUpCode: Enums.lookUpTypes.job.category.code,
//      required: false,
//      lookUpName: 'jobTitle',
//      multiple: false,
//        showInAdd: false,
//      defaultValue: getFirst(Enums.lookUpTypes.job.category.code)
//    }
  ]
});
newObjType({
    collection: Deals,
    name: 'deal',
    objGroupType: Enums.objGroupType.deal,
    services: ['messages', 'tasks', 'notes', 'tags'],
    fields: [
        {
            name: 'statusNote',
            displayName: 'Status note',
            showInAdd: true,
            required: false
        },
        { name: 'dealStatus',
            displayName: 'Status',
            fieldType: 'lookUp',
            lookUpName: 'dealStatus',
            lookUpCode: Enums.lookUpTypes.deal.status.code,
            required: true,

            multiple: false,
            defaultValue: getFirst(Enums.lookUpTypes.deal.status.code)
        },
        { name: 'dealCloseDate',
            displayName: 'Close Date',
            required: true,
            fieldType: 'date'
        },
        { name: 'dealEstimatedRevenue',
            displayName: 'Revenue',
            fieldType: 'number'
        },
        { name: 'dealRevenueFrequency',
            displayName: 'Frequency',
            fieldType: 'lookUp',
            lookUpName: 'dealRevenueFrequency',
            lookUpCode: Enums.lookUpTypes.deal.dealRevenueFrequency.code,
            defaultValue: getFirst(Enums.lookUpTypes.deal.dealRevenueFrequency),
            showInAdd: true,
            required: true,
        },
        { name: 'dealCloseConfidencePercentage',
            displayName: 'Confidence',
            fieldType: 'number'
        }
    ]
});

newObjType({
  objGroupType: Enums.objGroupType.contactable,
  parent: 'contactable',
  name: 'Customer',
  style: {
    icon: 'build',
    color: 'blue'
  },
  defaultPersonType: Enums.personType.organization,
  services: [],
  fields: [
    {
      name: 'department',
      displayName: 'Department',
      defaultValue: 'Primary'
    },
    {
      name: 'statusNote',
      displayName: 'Status note'
    }
  ]
});
newObjType({
  objGroupType: Enums.objGroupType.contactable,
  parent: 'contactable',
  name: 'Contact',
  style: {
    icon: 'contact',
    color: 'blue'
  },
  defaultPersonType: Enums.personType.human,
  services: [],
  fields: [
    {
      name: 'statusNote',
      displayName: 'Status note',
      showInAdd: true,
      required: false
    }
  ]
});
newObjType({
  objGroupType: Enums.objGroupType.contactable,
  parent: 'contactable',
  name: 'Employee',
  style: {
    icon: 'connection',
    color: 'blue'
  },
  defaultPersonType: Enums.personType.human,
  services: ['pastJobs', 'educations'],
  fields: [
    {
        name: 'statusNote',
        displayName: 'Status note',
        showInAdd: true,
        required: false
    }
      ,
    {
      name: 'recruiterStatus',
      displayName: 'Candidacy status',
      fieldType: 'lookUp',
      lookUpName: 'recruiterStatus',
      lookUpCode: Enums.lookUpTypes.employee.recruiterStatus.code,
      defaultValue: getFirst(Enums.lookUpTypes.employee.recruiterStatus),
      showInAdd: false,
      required: false,
    }
  ]
})
newObjType({
  objGroupType: Enums.objGroupType.job,
  parent: 'job',
  name: 'Direct Hire',
  style: {
    icon: 'briefcase',
    color: 'yellow'
  },
  services: [],
  fields: [
    {
      name: 'salary',
      displayName: 'Salary',
        fieldType: 'number',
        required: true
    },
    {
      name: 'fee',
      displayName: 'Fee (%)',
      fieldType: 'number'
    },
    {
      name: 'jobTitle',
      displayName: 'Job title',
      fieldType: 'lookUp',
      lookUpName: 'jobTitle',
      lookUpCode: Enums.lookUpTypes.job.titles.code,
      defaultValue: getFirst(Enums.lookUpTypes.job.titles.code)
    }
  ]
})
newObjType({
  objGroupType: Enums.objGroupType.job,
  parent: 'job',
  name: 'Temporary',
  style: {
    icon: 'briefcase',
    color: 'yellow'
  },
  services: [],
  fields: [
    {
      name: 'frequency',
      displayName: 'Pay Frequency',
      fieldType: 'lookUp',
      lookUpName: 'payRateFrequency',
      lookUpCode: Enums.lookUpTypes.payRate.frequencies.code,
      defaultValue: getFirst(Enums.lookUpTypes.payRate.frequencies.code)
    },
    {
      name: 'pay',
      displayName: 'Pay',
      fieldType: 'number'
    },
    {
      name: 'bill',
      displayName: 'Bill',
      fieldType: 'number'
    }
  ]
});
newObjType({
    objGroupType: Enums.objGroupType.deal,
    parent: 'deal',
    name: 'Deal',
    style: {
        icon: 'briefcase',
        color: 'yellow'
    },
    services: [],
    fields: [

        {
            name: 'displayName',
            displayName: 'Deal Name',
            required: true
        }


    ]
});

