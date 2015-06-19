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
  key: 'country',
  testValue: 'US',
  type: DocCenter.mergeFieldTypes.string,
  path: 'country',
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
  get: function (entity) {
    if (entity && entity.Employee && entity.Employee.hasTransportation) return 'yes';
    return 'no';
  },
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
},{
  key: 'availableStartDate',
  testValue: 'Monday,Wednesday',
  type: DocCenter.mergeFieldTypes.string,
  get: function (entity) {
    if (!entity || !entity.Employee) return '';

    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var result = '';
    _.each(entity.Employee.availableStartDate, function (v, k) {
      if (v){
        k = parseInt(k);
        if (result){
          result += ',';
        }
        result += dayNames[k];
      }
    });

    return result;

  },
  targetType: Enums.docCenterMergeFieldTypes.contactable
},{
  key: 'availableShifts',
  testValue: '1st,2nd',
  type: DocCenter.mergeFieldTypes.string,
  get: function (entity) {
    if (!entity || !entity.Employee) return '';

    var dayNames = ["1st", "2nd", "3rd"];
    var result = '';
    _.each(entity.Employee.availableShifts, function (v, k) {
      if (v){
        k = parseInt(k);
        if (result){
          result += ',';
        }
        result += dayNames[k];
      }
    });

    return result;

  },
  targetType: Enums.docCenterMergeFieldTypes.contactable
},

  // Education
  {
    key: 'educationInstitution1',
    testValue: 'High School',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.education || !entity.education.length > 0) return '';
      return entity.education[0].institution;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'educationDescription1',
    testValue: 'Example description',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.education || !entity.education.length > 0) return '';
      return entity.education[0].description;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'educationDegree1',
    testValue: 'Degree',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.education || !entity.education.length > 0) return '';
      return entity.education[0].degreeAwarded;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  },{
    key: 'educationInstitution2',
    testValue: 'High School',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.education || !entity.education.length > 1) return '';
      return entity.education[1].institution;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'educationDescription2',
    testValue: 'Example description',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.education || !entity.education.length > 1) return '';
      return entity.education[1].description;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'educationDegree2',
    testValue: 'Awarded degree',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.education || !entity.education.length > 1) return '';
      return entity.education[1].degreeAwarded;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  },

  // Past Jobs
  {
    key: 'pastJobCompany1',
    testValue: 'Company name',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].company;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobLocation1',
    testValue: '350 5th Ave',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].location;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobSupervisor1',
    testValue: 'John Smith',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].supervisor;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobPhone1',
    testValue: '555-555-5555',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].supervisorPhone;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobPosition1',
    testValue: 'Developer',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].position;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobResponsibilities1Line1',
    testValue: 'Example task',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].duties;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobResponsibilities1Line2',
    testValue: 'Example task',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].duties;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobStartDate1',
    testValue: '7/4/2015',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].start;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobEndDate1',
    testValue: '7/5/2015',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].end;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobReasonForLeaving1',
    testValue: 'Example reason',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].reasonForLeaving;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'okayToContact1',
    testValue: 'True',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 0) return '';
      return entity.pastJobs[0].okay2contact;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobCompany2',
    testValue: 'Company name',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].company;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobLocation2',
    testValue: '350 5th Ave',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].location;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobSupervisor2',
    testValue: 'John Smith',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].supervisor;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobPhone2',
    testValue: '555-555-5555',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].supervisorPhone;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobPosition2',
    testValue: 'Developer',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].position;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobResponsibilities2Line1',
    testValue: 'Example task',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].duties;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobResponsibilities2Line2',
    testValue: 'Example task',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].duties;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobStartDate2',
    testValue: '7/4/2015',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].start;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobEndDate2',
    testValue: '7/5/2015',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].end;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobReasonForLeaving2',
    testValue: 'Example reason',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].reasonForLeaving;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'okayToContact2',
    testValue: 'True',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 1) return '';
      return entity.pastJobs[1].okay2contact;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobCompany3',
    testValue: 'Company name',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].company;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobLocation3',
    testValue: '350 5th Ave',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].location;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobSupervisor3',
    testValue: 'John Smith',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].supervisor;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobPhone3',
    testValue: '555-555-5555',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].supervisorPhone;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobPosition3',
    testValue: 'Developer',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].position;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobResponsibilities3Line1',
    testValue: 'Example task',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].duties;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobResponsibilities3Line2',
    testValue: 'Example task',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].duties;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobStartDate3',
    testValue: '7/4/2015',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].start;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobEndDate3',
    testValue: '7/5/2015',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].end;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'pastJobReasonForLeaving3',
    testValue: 'Example reason',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].reasonForLeaving;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }, {
    key: 'okayToContact3',
    testValue: 'True',
    type: DocCenter.mergeFieldTypes.string,
    get: function () {
      if (!entity || !entity.pastJobs || !entity.pastJobs.length > 2) return '';
      return entity.pastJobs[2].okay2contact;
    },
    targetType: Enums.docCenterMergeFieldTypes.contactable
  }
];

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


