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

// Contactables
newObjType({
  collection: Contactables,
  objGroupType: Enums.objGroupType.contactable,
  name: 'contactable',
  services: ['messages', 'tasks', 'notes', 'tags', 'contactMethods']
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
      defaultValue: 'Primary',
      required: false
    },
    {
      name: 'statusNote',
      displayName: 'Status note',
      required: false
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
      defaultValue: null,
      showInAdd: false,
      required: false
    }
  ]
});

// Person
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
      displayName: 'Middle name',
      required: false
    },
    {
      name: 'jobTitle',
      displayName: 'Job title',
      required: false
    },
    {
      name: 'salutation',
      displayName: 'Salutation',
        showInAdd: false,
        required: false
    }
  ]
});

// Organization
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

// Jobs
newObjType({
    collection: Jobs,
    name: 'job',
    objGroupType: Enums.objGroupType.job,
    services: ['messages', 'tasks', 'notes', 'tags', 'candidates', 'jobRates'],
    fields: [{
      name: 'jobTitle',
      displayName: 'Job title',
      fieldType: 'lookUp',
      lookUpName: 'jobTitle',
      lookUpCode: Enums.lookUpTypes.job.titles.code,
      defaultValue: null,
      required: true
    }, {
      name: 'publicJobTitle',
      displayName: 'Public job title',
      required: false,
      showInAdd: false
    }, {
      name: 'statusNote',
      displayName: 'Status Note',
      required: false,
      showInAdd: false
    }, {
      name: 'jobDescription',
      displayName: 'Job Description',
      required: false,
      showInAdd: false
    }, {
      name: 'startDate',
      displayName: 'Start date',
      fieldType: 'date',
      defaultValue: null,
      required: true
    }, {
      name: 'endDate',
      displayName: 'End date',
      fieldType: 'date',
      defaultValue: null,
      required: false
    }, {
      name: 'numberRequired',
      displayName: 'Number required',
      fieldType: 'number',
      defaultValue: 1,
      required: false,
      showInAdd: false
    }, {
      name: 'duration',
      displayName: 'Duration',
      fieldType: 'lookUp',
      lookUpName: 'jobDuration',
      lookUpCode: Enums.lookUpTypes.job.duration.code,
      defaultValue: null,
      required: false,
      multiple: false,
      showInAdd: false
    }, {
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'jobStatus',
      lookUpCode: Enums.lookUpTypes.job.status.code,
      required: false,
      multiple: false,
      defaultValue: null,
      showInAdd: false
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
//      defaultValue: null
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
//      showInAdd: false,
//      defaultValue: null
//    }
  ]
});
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
      fieldType: 'number',
      required: false
    }
  ]
});
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
      defaultValue: null,
      required: false
    },
    {
      name: 'pay',
      displayName: 'Pay',
      fieldType: 'number',
      required: false
    },
    {
      name: 'bill',
      displayName: 'Bill',
      fieldType: 'number',
      required: false
    }
  ]
});

// Deals
newObjType({
    collection: Deals,
    name: 'deal',

    objGroupType: Enums.objGroupType.deal,
    style: {
      icon: 'briefcase',
      color: 'yellow'
    },
    services: ['messages', 'tasks', 'notes', 'tags'],
    fields: [
      {
        name: 'dealName',
        displayName: 'Deal Name',
        showInAdd: true,
        required: true
      }, {
        name: 'statusNote',
        displayName: 'Status note',
        showInAdd: true,
        required: false
      }, {
        name: 'dealStatus',
        displayName: 'Status',
        fieldType: 'lookUp',
        lookUpName: 'dealStatus',
        lookUpCode: Enums.lookUpTypes.deal.status.code,
        required: true,
        multiple: false,
        defaultValue: null
      }, {
        name: 'dealCloseDate',
        displayName: 'Close Date',
        required: true,
        fieldType: 'date'
      }, {
        name: 'dealEstimatedRevenue',
        displayName: 'Revenue',
        fieldType: 'number'
      }, {
        name: 'dealRevenueFrequency',
        displayName: 'Frequency',
        fieldType: 'lookUp',
        lookUpName: 'dealRevenueFrequency',
        lookUpCode: Enums.lookUpTypes.deal.dealRevenueFrequency.code,
        defaultValue: null,
        showInAdd: true,
        required: true
      }, {
        name: 'dealCloseConfidencePercentage',
        displayName: 'Confidence',
        fieldType: 'number',
        required: false
      }, {
        name: 'dealDescription',
        displayName: 'Deal Description',
        required: false,
        showInAdd: false
      }
  ]
});


newObjType({
  collection: Assignments,
  name: 'assignment',
  style: {
    icon: 'briefcase',
    color: 'blue'
  },
  objGroupType: Enums.objGroupType.assignment,
//  services: ['messages', 'tasks', 'notes', 'tags'],
  services: [],
  fields: [
    {
      name: 'statusNote',
      displayName: 'Status Note',
      showInAdd: false,
      required: false
    }, {
      name: 'startDate',
      displayName: 'Start date',
      fieldType: 'date',
      showInAdd: false,
      defaultValue: null,
      required: false
    }, {
      name: 'endDate',
      displayName: 'End date',
      fieldType: 'date',
      showInAdd: false,
      defaultValue: null,
      required: false
    }, {
      name: 'assignmentStatus',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'assignmentStatus',
      showInAdd: false,
      lookUpCode: Enums.lookUpTypes.assignment.status.code,
      required: false,
      multiple: false,
      defaultValue: null
    }

    ]
});


newObjType({
  collection: Candidates,
  name: 'candidate',
  style: {
    icon: 'briefcase',
    color: 'blue'
  },
  objGroupType: Enums.objGroupType.candidate,
  services: ['messages', 'tasks', 'notes', 'tags'],
  fields: [
    {
      name: 'statusNote',
      displayName: 'Status note',
      showInAdd: false,
      required: false
    }
  ]
});