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
  services: [], //[ 'tags', 'contactMethods'],
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
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'status',
      lookUpCode: Enums.lookUpTypes.customer.status.lookUpCode,
      defaultValue: null,
      showInAdd: false,
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
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'status',
      lookUpCode: Enums.lookUpTypes.contact.status.lookUpCode,
      defaultValue: null,
      showInAdd: false,
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
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'status',
      lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode,
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
    services: [],
    fields: [{
      name: 'jobTitle',
      displayName: 'Job title',
      fieldType: 'lookUp',
      lookUpName: 'jobTitle',
      lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode,
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
      lookUpCode: Enums.lookUpTypes.job.duration.lookUpCode,
      defaultValue: null,
      required: false,
      multiple: false,
      showInAdd: true
    }, {
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'jobStatus',
      lookUpCode: Enums.lookUpTypes.job.status.lookUpCode,
      required: false,
      multiple: false,
      defaultValue: null, // LookUps.findOne({lookUpCode: Enums.lookUpTypes.job.status.lookUpCode,isDefault:true}),
      showInAdd: true
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
        lookUpCode: Enums.lookUpTypes.deal.status.lookUpCode,
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
        lookUpCode: Enums.lookUpTypes.deal.dealRevenueFrequency.lookUpCode,
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
  collection: Matchups,
  name: 'matchup',
  style: {
    icon: 'briefcase',
    color: 'blue'
  },
  objGroupType: Enums.objGroupType.matchup,
//  services: ['messages', 'tasks', 'notes', 'tags'],
  services: [],
  fields: [
  {
      name: 'statusNote',
      displayName: 'Status Note',
      showInAdd: false,
      required: false
    }, {
      name: 'matchupStatus',
      displayName: 'Matchup Status',
      fieldType: 'lookUp',
      lookUpName: 'matchupStatus',
      showInAdd: true,
      lookUpCode: Enums.lookUpTypes.matchup.status.lookUpCode,
      required: true,
      multiple: false
    }, {
      name: 'candidateStatus',
      displayName: 'Candidate Status',
      fieldType: 'lookUp',
      lookUpName: 'candidateStatus',
      lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode,
      required: false,
      multiple: false
    }

    ]
});


