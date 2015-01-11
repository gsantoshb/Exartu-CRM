Enums = {};
_.extend(Enums, {
  emailTemplatesCategories:{
    all: 'all',
    employee: 'employee',
    customer: 'customer',
    job: 'job'
  },
  hotListCategories:{
    employee: 'employee',
    customer: 'customer',
    job: 'job'
  },
  stringConstants: {
    SearchTags: "Search tags..."
  },
  lookUpAction: {
    Implies_Inactive: "Implies_Inactive",
    Implies_Deleted: "Implies_Deleted",
    Implies_Active: "Implies_Active",
    Deal_Won: "Deal_Won",
    Deal_Lost: "Deal_Lost",
    Candidate_Sendout: "Sendout",
    Candidate_Submittal: "Submittal",
    Candidate_Placed: "Placed",
    ContactMethod_Phone: "ContactMethod_Phone",
    ContactMethod_MobilePhone:"ContactMethod_MobilePhone",
    ContactMethod_WorkPhone:"ContactMethod_WorkPhone",
    ContactMethod_HomePhone:"ContactMethod_HomePhone",
    ContactMethod_Email: "ContactMethod_Email",
    ContactMethod_WorkEmail: "ContactMethod_WorkEmail",
    ContactMethod_PersonalEmail: "ContactMethod_PersonalEmail",
    Job_Filled: "Job_Filled",
    Job_Unfilled: "Job_Unfilled",
    Job_Lost: "Job_Lost",
    JobTitle_Untitled: "JobTitle_Untitled",
    Placement_Candidate: "Candidate",
    Placement_Assigned: "Assigned",
    Is_RegularTime: "Regular Time",
    Is_Salary: "Salary"
  },

  lookUpCodes: {
    job_category: 0,
    job_industry: 1,
    job_duration: 2,
    job_status: 3,
    job_titles: 4,
    payRate_frequencies: 6,
    employee_status: 7,
    deal_status: 8,
    deal_dealRevenueFrequency: 9,
    candidate_status: 10,
    placement_status: 11,
    contact_status: 12,
    active_status: 13,
    customer_status: 14,
    contactMethod_types: 16,
    placement_rate:17
  }
});
_.extend(Enums, {
  hierarchiesRelation: {
    isParent: 1,
    isChild: -1,
    notRelated: 0
  },
  lookUpTypes: {
    deal: {
      status: {
        lookUpCode: Enums.lookUpCodes.deal_status,
        displayName: 'Deal statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Implies_Deleted, Enums.lookUpAction.Implies_Active, Enums.lookUpAction.Deal_Won,
          Enums.lookUpAction.Deal_Lost]
      },
      dealRevenueFrequency: {
        lookUpCode: Enums.lookUpCodes.deal_dealRevenueFrequency,
        displayName: 'Deal revenue frequency'
      }
    },
    candidate: {
      status: {
        lookUpCode: Enums.lookUpCodes.candidate_status,
        displayName: 'Candidate statuses',
        lookUpActions: [
          Enums.lookUpAction.Candidate_Submittal, Enums.lookUpAction.Candidate_Sendout, Enums.lookUpAction.Candidate_Placed]
      }
    },
    placement: {
      status: {
        lookUpCode: Enums.lookUpCodes.placement_status,
        displayName: 'Placement statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Implies_Active,Enums.lookUpAction.Implies_Deleted]
      },
      rate: {
        lookUpCode: Enums.lookUpCodes.placement_rate,
        displayName: 'Placement rates',
        lookUpActions: [Enums.lookUpAction.Is_RegularTime, Enums.lookUpAction.Is_Salary]
      }
    },
    job: {
      category: {
        lookUpCode: Enums.lookUpCodes.job_category,
        displayName: 'Job categories'
      },
      industry: {
        lookUpCode: Enums.lookUpCodes.job_industry,
        displayName: 'Job industries'
      },
      duration: {
        lookUpCode: Enums.lookUpCodes.job_duration,
        displayName: 'Job durations'
      },
      status: {
        lookUpCode: Enums.lookUpCodes.job_status,
        displayName: 'Job statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive, Enums.lookUpAction.Implies_Active,Enums.lookUpAction.Implies_Deleted,
          Enums.lookUpAction.Job_Filled, Enums.lookUpAction.Job_Unfilled, Enums.lookUpAction.Job_Lost]
      },
      titles: {
        lookUpCode: Enums.lookUpCodes.job_titles,
        displayName: 'Job titles',
        lookUpActions: [Enums.lookUpAction.JobTitle_Untitled]
      }
    },
    employee: {
      status: {
        lookUpCode: Enums.lookUpCodes.employee_status,

        displayName: 'Employee statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive, Enums.lookUpAction.Implies_Active,Enums.lookUpAction.Implies_Deleted]
      }
    },
    contact: {
      status: {
        lookUpCode: Enums.lookUpCodes.contact_status,
        displayName: 'Contact statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive, Enums.lookUpAction.Implies_Active,Enums.lookUpAction.Implies_Deleted]
      }
    },
    customer: {
      status: {
        lookUpCode: Enums.lookUpCodes.customer_status,
        displayName: 'Customer statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive, Enums.lookUpAction.Implies_Active,Enums.lookUpAction.Implies_Deleted]
      }
    },
    active: {
      status: {
        lookUpCode: Enums.lookUpCodes.active_status,
        displayName: 'Active statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive, Enums.lookUpAction.Implies_Active]
      }
    },
    payRate: {
      frequencies: {
        lookUpCode: Enums.lookUpCodes.payRate_frequencies,
        displayName: 'Pay rate frequencies'
      }
    },
    contactMethod: {
      type: {
        lookUpCode: Enums.lookUpCodes.contactMethod_types,
        displayName: 'Contact method types',
        lookUpActions: [Enums.lookUpAction.ContactMethod_Email, Enums.lookUpAction.ContactMethod_Phone, Enums.lookUpAction.ContactMethod_MobilePhone, Enums.lookUpAction.ContactMethod_HomePhone,
          Enums.lookUpAction.ContactMethod_WorkPhone,Enums.lookUpAction.ContactMethod_WorkEmail,Enums.lookUpAction.ContactMethod_PersonalEmail ]
      }
    }
  },

  documentType: {
    picture: {
      lookUpCode: 0,
      displayName: 'Picture'
    }
  },
  fieldType: {
    string: 0,
    int: 1,
    date: 2,
    select: 3,
    checkbox: 4,
    lookUp: 5
  },
  activitiesType: {
    contactableAdd: 0,
    messageAdd: 1,
    taskAdd: 2,
    jobAdd: 3,
    placementEdit: 4,
    placementAdd: 5,
    candidateAdd: 7,
    dealAdd: 6,
    userLogin: 9,
    noteAdd: 10,
    contactableUpdate: 11,
    fileAdd: 12
  },
  objGroupType: {
    contactable: 'contactable',
    job: 'job',
    deal: 'deal',
    quote: 'quote',
    placement: 'placement',
    hotList: 'hotList'
  },
  personType: {
    human: 'person',
    organization: 'organization'
  },
  roleFunction: {
    System_Administrator: 'System_Administrator',
    Client_Administrator: 'Client_Administrator',
    Recruiter_Consultant: 'Recruiter_Consultant',
    Staffing_Specialist: 'Recruiter_Consultant',
    Hiring_Manager: 'Hiring_Manager',
    Sales_Manager: 'Sales_Manager',
    Sales_Executive: 'Sales_Executive',
    Job_Applicant: 'Recruiter_Consultant',
    Contract_EmployeeEmployee: 'Recruiter_Consultant',
    Direct_Employee: 'Direct_Employee'
  },
  permissionFunction: {
    Sysadmin: 'SysAdmin',
    ClientAdmin: 'ClientAdmin',
    CRM: 'CRM',
    Sales: 'Sales',
    Recruiting: 'Recruiting'

  },
  candidateType: {
    recruiter: 'recruiter',
    applicant: 'applicant'
  },
  taskState: {
    future: 'Future',
    completed: 'Completed',
    pending: 'Pending',
    overDue: 'Over Due'
  },


  contactMethodTypes: {
    phone: 0,
    other: 1,
    email: 2
  },
  linkTypes: {
    contactable: {
      value: 0,
      displayName: 'Contacts'
    },
    job: {
      value: 1,
      displayName: 'Jobs'
    },
    deal: {
      value: 2,
      displayName: 'Deals'
    },
    placement: {
      value: 3,
      displayName: 'Placements'
    },
    candidate: {
      value: 4,
      displayName: 'Candidates'
    }

  },
  lastUsedType: {
    customer: 0,
    employee: 1
  }
})
;

/*
 *  Objects definitions
 */

fieldType = Enums.fieldType;
var person = {
  fields: [
    {
      name: 'firstName',
      displayName: 'First name',
      regex: /.*/,
      type: fieldType.string,
      defaultValue: '',
      required: true
    },
    {
      name: 'lastName',
      displayName: 'Last name',
      regex: /.*/,
      type: fieldType.string,
      defaultValue: '',
      required: true
    },
    {
      name: 'middleName',
      displayName: 'Middle name',
      regex: /.+/,
      type: fieldType.string,
      defaultValue: ''
    },
    {
      name: 'jobTitle',
      displayName: 'Job title',
      regex: /.+/,
      type: fieldType.string,
      defaultValue: ''
    },
    {
      name: 'salutation',
      displayName: 'Salutation',
      regex: /.+/,
      type: fieldType.string,
      defaultValue: ''
    }
  ]
};

var organization = {
  fields: [
    {
      name: 'organizationName',
      displayName: 'Organization name',
      regex: /.*/,
      type: fieldType.string,
      defaultValue: '',
      required: true
    }
  ]
};
var deal = {
  fields: []
};

var job = {
  fields: [
    {
      name: 'publicJobTitle',
      displayName: 'Public job title',
      regex: /.*/,
      fieldType: fieldType.string,
      defaultValue: '',
      required: true,
      showInAdd: true
    },
    {
      name: 'jobdescription',
      displayName: 'Job Description',
      regex: /.*/,
      fieldType: fieldType.string,
      defaultValue: '',
      required: false,
      showInAdd: true
    },
    {
      name: 'startDate',
      displayName: 'Start date',
      fieldType: fieldType.date,
      defaultValue: null,
      required: true,
      showInAdd: true
    },
    {
      name: 'endDate',
      displayName: 'End date',
      fieldType: fieldType.date,
      defaultValue: null,
      required: true,
      showInAdd: true
    },
    {
      name: 'duration',
      displayName: 'Duration',
      fieldType: fieldType.lookUp,
      lookUpName: 'jobDuration',
      defaultValue: null,
      required: true,
      showInAdd: true,
      multiple: false
    },
    {
      name: 'status',
      displayName: 'Status',
      fieldType: fieldType.lookUp,
      lookUpName: 'jobStatus',
      required: true,
      multiple: false,
      defaultValue: null,
      showInAdd: true
    },
    {
      name: 'industry',
      displayName: 'Industry',
      fieldType: fieldType.lookUp,
      lookUpName: 'jobIndustry',
      required: true,
      multiple: false,
      defaultValue: null,
      showInAdd: true
    },
    {
      name: 'category',
      displayName: 'Category',
      fieldType: fieldType.lookUp,
      lookUpName: 'jobCategory',
      required: true,
      multiple: false,
      defaultValue: null,
      showInAdd: true
    }
  ]
};

Global = {};

var generateObject = function (object) {
  var names = _.map(object.fields, function (item) {
    return item.name;
  });
  var values = _.map(object.fields, function (item) {
    return item.defaultValue;
  });
  return _.object(names, values);
};
_.extend(Global, {
  defaultEmployeePicture: '/assets/user-photo-placeholder.jpg'
});
_.extend(Global, {
  // person
  personFields: person.fields,
  person: function () {
    return generateObject(person);
  },
  // organization
  organizationFields: organization.fields,
  organization: function () {
    return generateObject(organization);
  },
  // job
  jobFields: job.fields,
  job: function () {
    return generateObject(job);
  },
  // deal
  dealFields: deal.fields,
  deal: function () {
    return generateObject(deal);
  }
});