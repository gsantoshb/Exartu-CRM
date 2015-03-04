var mergeFields=[{
  key: 'firstName',
  testValue: 'john',
  type: DocCenter.mergeFieldTypes.string,
  path: 'person.firstName',
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'lastName',
  testValue: 'Doe',
  type: DocCenter.mergeFieldTypes.string,
  path: 'person.lastName',
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'ssn',
  testValue: '111-11-1111',
  type: DocCenter.mergeFieldTypes.string,
  path: 'Employee.taxID',
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'addressLine1',
  testValue: '350 5th Ave',
  type: DocCenter.mergeFieldTypes.string,
  path: 'address',
  targetType: Enums.docCenterMergeFieldTypes.address
},{
  key: 'addressLine2',
  testValue: 'Apartment A-12',
  type: DocCenter.mergeFieldTypes.string,
  path: 'address2',
  targetType: Enums.docCenterMergeFieldTypes.address
},{
  key: 'city',
  testValue: 'New York City',
  type: DocCenter.mergeFieldTypes.string,
  path: 'city',
  targetType: Enums.docCenterMergeFieldTypes.address
},{
  key: 'state',
  testValue: 'New York',
  type: DocCenter.mergeFieldTypes.string,
  path: 'state',
  targetType: Enums.docCenterMergeFieldTypes.address
},{
  key: 'zipCode',
  testValue: '10118',
  type: DocCenter.mergeFieldTypes.string,
  path: 'postalCode',
  targetType: Enums.docCenterMergeFieldTypes.address
},{
  key: 'dateOfBirth',
  testValue: '7/4/1974',
  type: DocCenter.mergeFieldTypes.date,
  path: 'person.birthDate',
  targetType: Enums.docCenterMergeFieldTypes.contactable
}];
DocCenterMergeFields.after.update(function (userId, doc, fieldNames, modifier, options) {
  DocCenterManager.updateMergeFields(doc._id);
});

DocCenterMergeFields.after.insert(function (userId, doc, fieldNames, modifier, options) {
  DocCenterManager.insertMergeFields(doc._id);
});

_.each(mergeFields, function (mf) {
  var oldVersion = DocCenterMergeFields.findOne({ key: mf.key });

  if (!oldVersion){
    DocCenterMergeFields.insert(mf);
  }else{
    mf._id = oldVersion._id;
    if ( ! EJSON.equals(mf, oldVersion)){
      delete mf._id;
      DocCenterMergeFields.update(oldVersion._id, { $set: mf });
    }
  }
});


