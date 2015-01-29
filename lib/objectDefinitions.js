/**
 * Created by visualaram on 1/27/15.
 */
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