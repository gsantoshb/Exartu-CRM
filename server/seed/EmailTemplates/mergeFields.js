var mergeFields=[{
  name: 'employeeFirstName',
  displayName: 'Employee.firstName',
  path: 'person.firstName',
  objType: 'Employee',
  testValue: 'John'
},{
  name: 'customerOrganizationName',
  displayName: 'Customer.organizationName',
  path: 'organization.organizationName',
  objType: 'Customer',
  testValue: 'Super Company'
},{
  name: 'employeeLocation',
  displayName: 'Employee.location',
  path: 'location',
  objType: 'Employee',
  testValue: '742 Evergreen Terrace, Springfield',
  formatValue: function (location) {
    return _.values(location).join(', '); //todo: improve this
  }
},{
  name: 'jobLocation',
  displayName: 'Job.location',
  path: 'location',
  objType: 'job',
  testValue: '742 Evergreen Terrace, Springfield',
  formatValue: function (location) {
    return location && _.values(location).join(', '); //todo: improve this
  }
},{
  name: 'jobPublicTitle',
  displayName: 'Job.title',
  path: 'publicJobTitle',
  objType: 'job',
  testValue: '742 Evergreen Terrace, Springfield'
}];

_.each(mergeFields, function (mf) {
  var oldVersion = EmailTemplateMergeFields.findOne({name: mf.name}),
    id;
  if (!oldVersion){
    id = EmailTemplateMergeFields.insert(mf);
  }else{
    EmailTemplateMergeFields.update(oldVersion._id, { $set: mf });
    id = oldVersion._id;
  }

  if (mf.formatValue){
    EmailTemplateMergeFields.formatValues = EmailTemplateMergeFields.formatValues || {};
    EmailTemplateMergeFields.formatValues[id] = mf.formatValue;
  }
});
