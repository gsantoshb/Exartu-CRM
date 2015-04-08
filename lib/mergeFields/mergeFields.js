
_.extend(MergeFieldHelper, { mergeFields: [
  // Employee
  {
    displayName: 'First Name',
    key: 'employeeFirstName',
    testValue: 'John',
    category: MergeFieldHelper.categories.employee.value,
    getValue: function (contactable) {
      if (contactable && contactable.person && contactable.person.firstName)
        return contactable.person.firstName;
      return '';
    }
  },
  {
    displayName: 'Last Name',
    key: 'employeeLastName',
    testValue: 'Doe',
    category: MergeFieldHelper.categories.employee.value,
    getValue: function (contactable) {
      if (contactable && contactable.person && contactable.person.lastName)
        return contactable.person.lastName;
      return '';
    }
  },
  {
    displayName: 'Email Address',
    key: 'employeeEmail',
    testValue: 'johndoe@mail.com',
    category: MergeFieldHelper.categories.employee.value,
    getValue: function (contactable) {
      var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
      var emailCMTypes =  _.pluck(LookUps.find({
        hierId: rootHier,
        lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
        lookUpActions: {$in: [
          Enums.lookUpAction.ContactMethod_Email,
          Enums.lookUpAction.ContactMethod_PersonalEmail,
          Enums.lookUpAction.ContactMethod_WorkEmail
        ]}
      }).fetch(), '_id');

      var email = _.find(contactable.contactMethods, function (cm) {
        return _.indexOf(emailCMTypes, cm.type) != -1
      });

      return email ? email.value : '';
    }
  },
  {
    displayName: 'Job title',
    key: 'employeeJobTitle',
    testValue: 'Electric Engineer',
    category: MergeFieldHelper.categories.employee.value,
    getValue: function (contactable) {
      if (contactable && contactable.person && contactable.person.jobTitle)
        return contactable.person.jobTitle;
      return '';
    }
  },
  {
    displayName: 'Location',
    key: 'employeeLocation',
    testValue: '742 Evergreen Terrace, Springfield',
    category: MergeFieldHelper.categories.employee.value,
    getValue: function (contactable) {
      if (contactable && contactable.location)
        return contactable.location;
      return '';
    }
  },

  // Client
  {
    displayName: 'Organization Name',
    key: 'clientOrgName',
    testValue: 'Super Company',
    category: MergeFieldHelper.categories.client.value,
    getValue: function (client) {
      if (client && client.organization && client.organization.organizationName)
        return client.organization.organizationName;
      return '';
    }
  },

  // Contact
  {
    displayName: 'First Name',
    key: 'contactFirstName',
    testValue: 'John',
    category: MergeFieldHelper.categories.contact.value,
    getValue: function (contactable) {
      if (contactable && contactable.person && contactable.person.firstName)
        return contactable.person.firstName;
      return '';
    }
  },
  {
    displayName: 'Last Name',
    key: 'contactLastName',
    testValue: 'Doe',
    category: MergeFieldHelper.categories.contact.value,
    getValue: function (contactable) {
      if (contactable && contactable.person && contactable.person.lastName)
        return contactable.person.lastName;
      return '';
    }
  },
  {
    displayName: 'Email Address',
    key: 'contactEmail',
    testValue: 'johndoe@mail.com',
    category: MergeFieldHelper.categories.contact.value,
    getValue: function (contactable) {
      var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
      var emailCMTypes =  _.pluck(LookUps.find({
        hierId: rootHier,
        lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
        lookUpActions: {$in: [
          Enums.lookUpAction.ContactMethod_Email,
          Enums.lookUpAction.ContactMethod_PersonalEmail,
          Enums.lookUpAction.ContactMethod_WorkEmail
        ]}
      }).fetch(), '_id');

      var email = _.find(contactable.contactMethods, function (cm) {
        return _.indexOf(emailCMTypes, cm.type) != -1
      });

      return email ? email.value : '';
    }
  }
]});