var mergeFields=[{
    key: 'firstName',
    testValue: 'john',
    type: DocCenter.mergeFieldTypes.string,
    path: 'person.firstName'
  },{
    key: 'lastName',
    testValue: 'Doe',
    type: DocCenter.mergeFieldTypes.string,
    path: 'person.lastName'
  },{
    key: 'ssn',
    testValue: '111-11-1111',
    type: DocCenter.mergeFieldTypes.string,
    path: 'Employee.taxID'
  },{
    key: 'addressLine1',
    testValue: '350 5th Ave',
    type: DocCenter.mergeFieldTypes.string,
    path: 'addresses[0].address'
  },{
    key: 'addressLine2',
    testValue: 'Apartment A-12',
    type: DocCenter.mergeFieldTypes.string,
    path: 'addresses[0].address2'
  },{
    key: 'city',
    testValue: 'New York City',
    type: DocCenter.mergeFieldTypes.string,
    path: 'addresses[0].city'
  },{
    key: 'state',
    testValue: 'New York',
    type: DocCenter.mergeFieldTypes.string,
    path: 'addresses[0].state'
  },{
    key: 'zipCode',
    testValue: '10118',
    type: DocCenter.mergeFieldTypes.string,
    path: 'addresses[0].postalCode'
  },{
    key: 'dateOfBirth',
    testValue: '7/4/1974',
    type: DocCenter.mergeFieldTypes.date,
    path: 'person.birthDate'
  }
];
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


