Enums = {};
_.extend(Enums, {
    activitiesType: {
        contactableAdd: 0,
        messageAdd: 1
    },
    hierarchiesRelation: {
        isParent: 1,
        isChild: -1,
        notRelated: 0,
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
        messageAdd: 1
    },
    objGroupType: {
        contactable: 'contactable',
        job: 'job',
        deal: 'deal',
        quote: 'quote'
    },
    personType: {
        human: 'human',
        organization: 'organization'
    },
    roleFunction: {
        System_Administrator: 'System_Administrator',
        Tenant_Administrator: 'Tenant_Administrator',
        Recruiter_Consultant: 'Recruiter_Consultant',
        Staffing_Specialist: 'Recruiter_Consultant',
        Hiring_Manager: 'Hiring_Manager',
        Sales_Manager: 'Sales_Manager',
        Sales_Executive: 'Sales_Executive',
        Job_Applicant: 'Recruiter_Consultant',
        Contract_Employee: 'Recruiter_Consultant',
        Direct_Employee: 'Direct_Employee'
    },
    permissionFunction: {
        Sysadmin: 'SysAdmin',
        TenantAdmin: 'TenantAdmin',
        CRM: 'CRM',
        Sales: 'Sales',
        Recruiting: 'Recruiting'

    }
});

/*
 *  Objects definitions
 */

fieldType = Enums.fieldType;
var person = {
    fields: [
        {
            name: 'firstName',
            regex: /.*/,
            type: fieldType.string,
            defaultValue: '',
            required: true
        },
        {
            name: 'lastName',
            regex: /.*/,
            type: fieldType.string,
            defaultValue: '',
            required: true
        },
        {
            name: 'middleName',
            regex: /.+/,
            type: fieldType.string,
            defaultValue: ''
        },
        {
            name: 'jobTitle',
            regex: /.+/,
            type: fieldType.string,
            defaultValue: ''
        },
        {
            name: 'salutation',
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
            regex: /.*/,
            type: fieldType.string,
            defaultValue: '',
            required: true
        }
    ]
}

var job = {
    fields: [
        {
            name: 'publicJobTitle',
            regex: /.*/,
            fieldType: fieldType.string,
            defaultValue: '',
            required: true,
            showInAdd: true
        }, {
            name: 'startDate',
            fieldType: fieldType.date,
            defaultValue: null,
            required: true,
            showInAdd: true
        }, {
            name: 'endDate',
            fieldType: fieldType.date,
            defaultValue: null,
            required: true,
            showInAdd: true
        }, {
            name: 'duration',
            fieldType: fieldType.lookUp,
            lookUpName: 'jobDuration',
            defaultValue: null,
            required: true,
            showInAdd: true
        }, {
            name: 'status',
            fieldType: fieldType.lookUp,
            lookUpName: 'jobStatus',
            required: true,
            lookUpName: 'jobTitle',
            multiple: false,
            defaultValue: null,
            showInAdd: true
        }, {
            name: 'industry',
            tyfieldTypepe: fieldType.lookUp,
            lookUpName: 'jobIndustry',
            required: true,
            lookUpName: 'jobTitle',
            multiple: false,
            defaultValue: null,
            showInAdd: true
        }, {
            name: 'category',
            fieldType: fieldType.lookUp,
            lookUpName: 'jobCategory',
            required: true,
            lookUpName: 'jobTitle',
            multiple: false,
            defaultValue: null,
            showInAdd: true
        },
    ]
}

Global = {};

var generateObject = function (object) {
    var names = _.map(object.fields, function (item) {
        return item.name;
    });
    var values = _.map(object.fields, function (item) {
        return item.defaultValue;
    })
    return _.object(names, values);
}

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
    }
});