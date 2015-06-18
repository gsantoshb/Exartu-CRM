
// Activities
Contactables.after.insert(function (userId, doc) {
  var mainTypes = ['Employee', 'Contact', 'Client'];

  var data = {};
  data.dateCreated = new Date();
  data.objTypeName = _.find(doc.objNameArray, function (item) {
    return mainTypes.indexOf(item) >= 0
  });

  if (doc.person) {
    data.displayName = doc.person.lastName + ', ' + doc.person.firstName + ' ' + doc.person.middleName;
    data.person = { jobTitle: doc.person.jobTitle }
  } else {
    data.displayName = doc.organization.organizationName;
  }
  var obj = {
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.contactableAdd,
    entityId: doc._id,
    data: data
  };

  if (doc && doc.testData) obj.testData = true;

  Activities.insert(obj)
});


// Tags
Contactables.after.insert(function (userId, doc) {
  if (doc.tags != null) {
    _.forEach(doc.tags, function (t) {
      if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
        Tags.insert({tags: t, hierId: doc.hierId});
      }
    });
  }
});


// Contactables View
Contactables.after.insert(function (userId, contactable) {
  // extract what the contactable list needs
  // this fields are all present when inserting a contactable (tags is only present in API posts)
  var view = _.pick(contactable,'_id','userId', 'hierId', 'dateCreated', 'contactMethods', 'activeStatus', 'tags');

  // display name
  if (contactable.person){
    view.person = true;
    view.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + (contactable.person.middleName ? (' ' + contactable.person.middleName): '');
  }else if (contactable.organization){
    view.organization = true;
    view.displayName = contactable.organization.organizationName;
  }

  // contacts
  if (contactable.Contact) {
    view.Contact = true;
    if (contactable.Contact.client){
      view.client = contactable.Contact.client;
      var client = Contactables.findOne(contactable.Contact.client, {fields: {'organization.organizationName': 1}});
      view.clientName = client.organization.organizationName;
    }
    view.contactStatus = contactable.Contact.status;
  }

  // clients
  if (contactable.Client) {
    view.Client = true;
    view.clientStatus = contactable.Client.status;
    view.department = contactable.Client.department;
  }

  // employees
  if (contactable.Employee) {
    view.Employee = true;
    view.employeeStatus = contactable.Employee.status;
    view.taxID = contactable.Employee.taxID;
  }

  ContactablesView.insert(view);
});


// Past Job Leads View
Contactables.after.insert(function (userId, doc) {
  if (doc.Employee && doc.pastJobs) {
    _.each(doc.pastJobs, function (p) {
      var newPastJob = p;
      _.extend(newPastJob, {comment: "", active: true});
      _.extend(newPastJob, {_id: newPastJob.id});
      _.extend(newPastJob, {hierId: Meteor.user().currentHierId});
      _.extend(newPastJob, {employeeId: doc._id, employeeName: doc.displayName});
      newPastJob = _.omit(newPastJob, 'id');
      PastJobLeads.insert(newPastJob);
    })
  }
});


// TW Enterprise sync
Contactables.after.insert(function (userId, doc) {
  // Sync only when an account has been set up for the document hier
  var hier = Hierarchies.findOne(doc.hierId);
  if (hier && hier.enterpriseAccount) {
    // Set up account info for the helper
    var accountInfo = {
      hierId: hier._id,
      username: hier.enterpriseAccount.username,
      password: hier.enterpriseAccount.password,
      accessToken: hier.enterpriseAccount.accessToken,
      tokenType: hier.enterpriseAccount.tokenType
    };

    var data = {};

    // Add Employee
    if (doc.Employee) {
      data.firstName = doc.person.firstName;
      data.lastName = doc.person.lastName;

      if (doc.Employee.taxID)
        data.ssn = doc.Employee.taxID.replace(/-/g,'');

      TwApi.addEmployee(doc._id, data, accountInfo);
    }
  }
});
