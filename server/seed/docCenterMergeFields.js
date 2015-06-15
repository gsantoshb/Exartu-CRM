var mergeFields = [{
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
},{
  key: 'gender',
  testValue: 'female',
  type: DocCenter.mergeFieldTypes.string,
  get: function (entity) {
    if (!entity || !entity.Employee) return '';

    switch (entity.Employee.gender){
      case Enums.gender.male.value: return 'Male';
      case Enums.gender.female.value: return 'Female';
      default: return '';
    }
  },
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'convictions',
  testValue: 'hard worker',
  type: DocCenter.mergeFieldTypes.string,
  path: 'Employee.convictions',
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'ethnicity',
  testValue: 'african american',
  type: DocCenter.mergeFieldTypes.string,
  path: 'Employee.ethnicity',
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'hasOwnTransportation',
  testValue: 'true',
  type: DocCenter.mergeFieldTypes.string,
  path: 'Employee.hasTransportation',
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'desiredPay',
  testValue: '1000',
  type: DocCenter.mergeFieldTypes.decimal,
  path: 'Employee.desiredPay',
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'email',
  testValue: 'someAddrress@someServer.com',
  type: DocCenter.mergeFieldTypes.string,
  get: function (entity) {
    if (!entity || !entity.contactMethods) return '';
    var cm = _.find(entity.contactMethods, function (cm) {
      var lookUp = LookUps.findOne({_id: cm.type, hierId: entity.hierId});
      if (!lookUp){
        return false;
      }
      return _.contains(lookUp.lookUpActions, Enums.lookUpAction.ContactMethod_Email);
    });
    return cm && cm.value;

  },
  targetType: Enums.docCenterMergeFieldTypes.contactable
}];

Meteor.startup(function () {
  _.each(mergeFields, function (mf) {
    var oldVersion = _.findWhere(DocCenterMergeFields, { key: mf.key });

    if (!oldVersion){
      DocCenterMergeFields.push(mf);
    }else{
      //mf._id = oldVersion._id;
      //if ( ! EJSON.equals(mf, oldVersion)){
      //  delete mf._id;
      //  DocCenterMergeFields.update(oldVersion._id, { $set: mf });
      //}
    }
  });

  //DocCenterMergeFields.remove({key: {$nin: _.pluck(mergeFields, 'key')}});


  DocCenterManager.syncMergeFields();
});


