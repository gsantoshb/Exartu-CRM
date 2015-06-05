
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

    //// Add Contact
    //else if (doc.Contact) {
    //  data.firstName = doc.person.firstName;
    //  data.lastName = doc.person.lastName;
    //
    //  TwApi.addContact(doc._id, data, accountInfo);
    //}
    //
    //// Add Client
    //else if (doc.Client) {
    //  data.name = doc.organization.organizationName;
    //
    //  TwApi.addClient(doc._id, data, accountInfo);
    //}
  }
});


Contactables.after.update(function (userId, doc, fieldNames, modifier, options) {
  // Sync only when an account has been set up for the document hier and the document has been sync
  if (doc.externalId) {
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

      // Update Employee
      if (doc.Employee) {
        // Check if person fields were modified
        if (fieldNames.indexOf('person') != -1) {
          if (this.previous.person.firstName != doc.person.firstName)
            data.firstName = doc.person.firstName;
          if (this.previous.person.lastName != doc.person.lastName)
            data.lastName = doc.person.lastName;
        }
        // Check if Employee fields were modified
        if (fieldNames.indexOf('Employee') != -1) {
          if (this.previous.Employee.taxID != doc.Employee.taxID)
            data.ssn = doc.Employee.taxID.replace(/-/g,'');
        }

        TwApi.updateEmployee(doc.externalId, data, accountInfo);
      }

      //// Update Contact
      //else if (doc.Contact) {
      //  // Check if person fields were modified
      //  if (fieldNames.indexOf('person') != -1) {
      //    if (this.previous.person.firstName != doc.person.firstName)
      //      data.firstName = doc.person.firstName;
      //    if (this.previous.person.lastName != doc.person.lastName)
      //      data.lastName = doc.person.lastName;
      //  }
      //
      //  TwApi.updateContact(doc.externalId, data, accountInfo);
      //}
      //
      //// Update Client
      //else if (doc.Client) {
      //  // Check if organization fields were modified
      //  if (fieldNames.indexOf('organization') != -1) {
      //    if (this.previous.organization.organizationName != doc.organization.organizationName)
      //      data.firstName = doc.organization.organizationName;
      //  }
      //
      //  TwApi.updateClient(doc.externalId, data, accountInfo);
      //}
    }
  }
});

// Addresses
Addresses.after.insert(function (userId, address) { syncAddress(address); });
Addresses.after.update(function (userId, address, fieldNames, modifier) { syncAddress(address); });
var syncAddress = function (address) {
  var contactable = Contactables.findOne(address.linkId, {fields:{_id: 1, hierId: 1, externalId: 1, Employee: 1}});

  // Sync only when an account has been set up for the contactable hier and the contactable has been sync
  if (contactable && contactable.externalId) {
    var hier = Hierarchies.findOne(contactable.hierId);
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
      data.address = address.address;
      data.address2 = address.address2;
      data.city = address.city;
      data.zip = address.postalCode;

      // Try to find the state code that matches the string name
      var state = _.find(StateCodes, function (state) {return state.name.toLowerCase() == address.state.toLowerCase()});
      if (state) data.state = state.code;

      // Update Employee
      if (contactable.Employee) {
        TwApi.updateEmployee(contactable.externalId, data, accountInfo);
      }
    }
  }
};