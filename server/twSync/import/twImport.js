
TwImport = {
  importContactables: function (userId, accountInfo) {
    var hierId = Utils.getUserHierId(userId);
    var apiHelper = new TwApiHelper(accountInfo);

    // Import Employees
    importEmployees(userId, apiHelper);

    // Import Clients
    importClients(userId, apiHelper);

    // Import Contacts
    importContacts(userId, apiHelper);

    // Remove the skipTwSync flag from contactable
    var hierFilter = Utils.filterByHiers(hierId);
    Contactables.update({$or: hierFilter}, {$unset: {skipTwSync: ""}}, {multi: true});

    // Mark the sync is over
    Hierarchies.update({_id: accountInfo.hierId}, {$unset: {'enterpriseAccount.contactablesSync': ''}});
  }
};

var importEmployees = function (userId, apiHelper) {
  console.log('Importing TW Employees...');

  // Get all employees
  try {
    var result = apiHelper.post('/Employee/allActive', {});
    if (result) {
      // Insert each employee when necessary
      _.each(result, function (twEmp) {
        // Check if the employee is already in the database
        var employee = Utils.filterCollectionByUserHier2(userId, Contactables.find({externalId: twEmp.aIdent.toString()}, {fields: {_id: 1}})).fetch();
        if (!employee.length) {
          console.log('Importing Employee', twEmp.aIdent);

          // Create the employee to insert
          employee = createContactable('Employee', twEmp, twEmp.aIdent.toString(), userId, apiHelper.hierId);

          // Insert the employee in the db
          try {
            var empId = ContactableManager.create(employee);
            if (empId && Contactables.findOne({_id: empId}, {fields: {_id: 1}})) {
              // Address
              if (twEmp.address && twEmp.city) {
                // Address type
                var hierFilter = Utils.filterByHiers(apiHelper.hierId);
                var addressType = LookUps.findOne({
                  lookUpCode: Enums.lookUpTypes.linkedAddress.type.lookUpCode,
                  $or: hierFilter
                });

                var address = {
                  addressTypeId: addressType._id,
                  linkId: empId,
                  address: twEmp.address,
                  city: twEmp.city,
                  country: 'United States',
                  userId: userId,
                  hierId: apiHelper.hierId
                };

                // Add optional fields
                if (twEmp.address2) address.address2 = twEmp.address2;
                if (twEmp.state) address.state = twEmp.state;
                if (twEmp.zip) address.postalCode = twEmp.zip;

                AddressManager.addEditAddress(address);
              }

              // Add notes
              importNotes(userId, apiHelper, 'Employee', twEmp.aIdent.toString(), empId);

              // Add Tags
              importTags(apiHelper, 'Employee', twEmp.aIdent.toString(), empId);
            }
          } catch (ex) {
            console.log('Error Inserting Employee', twEmp.aIdent, ex.message);
          }

        } else {
          console.log('Skipping Employee', twEmp.aIdent);
        }
      });
    }
  } catch (ex) {
    // Mark the sync failed
    Hierarchies.update({_id: apiHelper.hierId}, {$set: {
      'enterpriseAccount.contactablesSync': false,
      'enterpriseAccount.contactablesSyncError': "TW Import failed importing employees. " + ex.message
    }});

    throw new Error("TW Import failed importing employees. " + ex.message);
  }
};

var importClients = function (userId, apiHelper) {
  console.log('Importing TW Clients...');

  // Get all clients
  try {
    var result = apiHelper.post('/Customer/allActive', {});
    if (result) {
      // Insert each client when necessary
      _.each(result, function (twClient) {
        // Check if the client is already in the database
        var client = Utils.filterCollectionByUserHier2(userId, Contactables.find({externalId: twClient.customerId.toString()}, {fields: {_id: 1}})).fetch();
        if (!client.length) {
          console.log('Importing Client', twClient.customerId);

          // Create the client to insert
          client = createContactable('Client', twClient, twClient.customerId.toString(), userId, apiHelper.hierId);

          // Insert the client in the db
          try {
            var clientId = ContactableManager.create(client);
            if (clientId && Contactables.findOne({_id: clientId}, {fields: {_id: 1}})) {
              // Address
              if (twClient.street1 && twClient.city) {
                // Address type
                var hierFilter = Utils.filterByHiers(apiHelper.hierId);
                var addressType = LookUps.findOne({
                  lookUpCode: Enums.lookUpTypes.linkedAddress.type.lookUpCode,
                  $or: hierFilter
                });

                var address = {
                  addressTypeId: addressType._id,
                  linkId: clientId,
                  address: twClient.street1,
                  city: twClient.city,
                  country: 'United States',
                  userId: userId,
                  hierId: apiHelper.hierId
                };

                // Add optional fields
                if (twClient.street2) address.address2 = twClient.street2;
                if (twClient.state) address.state = twClient.state;
                if (twClient.zip) address.postalCode = twClient.zip;

                AddressManager.addEditAddress(address);
              }

              // Add notes
              importNotes(userId, apiHelper, 'Customer', twClient.customerId.toString(), clientId);
            }
          } catch (ex) {
            console.log('Error Inserting Client', twEmp.aIdent, ex.message);
          }

        } else {
          console.log('Skipping Client', twClient.customerId);
        }
      });
    }
  } catch (ex) {
    // Mark the sync failed
    Hierarchies.update({_id: apiHelper.hierId}, {$set: {
      'enterpriseAccount.contactablesSync': false,
      'enterpriseAccount.contactablesSyncError': "TW Import failed importing clients. " + ex.message
    }});

    throw new Error("TW Import failed importing clients. " + ex.message);

  }
};

var importContacts = function (userId, apiHelper) {
  console.log('Importing TW Contacts...');

  // Get all contacts
  try {
    var result = apiHelper.post('/Contacts/allActive', {});
    if (result) {
      // Insert each contact when necessary
      _.each(result, function (twContact) {
        // Check if the contact is already in the database
        var contact = Utils.filterCollectionByUserHier2(userId, Contactables.find({externalId: twContact.id.toString()}, {fields: {_id: 1}})).fetch();
        if (!contact.length) {
          console.log('Importing Contact', twContact.id);

          // Create the contact to insert
          contact = createContactable('Contact', twContact, twContact.id.toString(), userId, apiHelper.hierId);

          // Insert the contact in the db
          try {
            var contactId = ContactableManager.create(contact);
            if (contactId && Contactables.findOne({_id: contactId}, {fields: {_id: 1}})) {
              // Address
              if (twContact.street1 && twContact.city) {
                // Address type
                var hierFilter = Utils.filterByHiers(apiHelper.hierId);
                var addressType = LookUps.findOne({
                  lookUpCode: Enums.lookUpTypes.linkedAddress.type.lookUpCode,
                  $or: hierFilter
                });

                var address = {
                  addressTypeId: addressType._id,
                  linkId: contactId,
                  address: twContact.street1,
                  city: twContact.city,
                  country: 'United States',
                  userId: userId,
                  hierId: apiHelper.hierId
                };

                // Add optional fields
                if (twContact.street2) address.address2 = twContact.street2;
                if (twContact.state) address.state = twContact.state;
                if (twContact.zip) address.postalCode = twContact.zip;

                AddressManager.addEditAddress(address);
              }

              // Add notes
              importNotes(userId, apiHelper, 'Contacts', twContact.id.toString(), contactId);
            }
          } catch (ex) {
            console.log('Error Inserting Contact', twEmp.aIdent, ex.message);
          }

        } else {
          console.log('Skipping Contact', twContact.id);
        }
      });
    }
  } catch (ex) {
    // Mark the sync failed
    Hierarchies.update({_id: apiHelper.hierId}, {$set: {
      'enterpriseAccount.contactablesSync': false,
      'enterpriseAccount.contactablesSyncError': "TW Import failed importing contacts. " + ex.message
    }});

    throw new Error("TW Import failed importing contacts. " + ex.message);
  }
};

var createContactable = function (type, data, externalId, userId, hierId) {
  var contactable = {
    skipTwSync: true,
    objNameArray: ['contactable', type],
    contactMethods: [],
    externalId: externalId,
    userId: userId,
    hierId: hierId
  };

  // Active Status
  var hierFilter = Utils.filterByHiers(hierId);
  var activeStatus = LookUps.findOne({
    lookUpCode: Enums.lookUpTypes.active.status.lookUpCode,
    isDefault: true,
    $or: hierFilter
  });
  contactable.activeStatus = activeStatus._id;

  contactable[type] = {statusNote: ''};

  if (type == 'Employee' || type == 'Contact') {
    contactable.objNameArray.push('person');
    contactable.person = {
      firstName: data.firstName || 'NA',
      lastName: data.lastName || 'NA'
    };

    //SSN
    if (data.ssn && contactable.Employee) {
      contactable.Employee.taxID = data.ssn.toString();
    }

    // Client ID
    if (data.customerId && contactable.Contact) {
      var customer = Utils.filterCollectionByUserHier2(userId, Contactables.find({externalId: data.customerId.toString()}, {fields: {_id: 1}})).fetch();
      if (customer.length == 1) contactable.Contact.client = customer[0]._id;
    }
  } else if (type == 'Client') {
    contactable.objNameArray.push('organization');
    contactable.organization = {
      organizationName: data.customerName,
      department: data.departmentName
    };

    contactable.Client.department = data.departmentName;
  }

  // Contact Methods
  // Phone contact method
  if (data.phoneNumber) {
    var phoneCM = LookUps.findOne({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: Enums.lookUpAction.ContactMethod_Phone,
      $or: hierFilter
    });
    contactable.contactMethods.push({type: phoneCM._id, value: data.phoneNumber});
  }
  // Cellphone contact method
  if (data.cellPhone) {
    var cellPhoneCM = LookUps.findOne({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: Enums.lookUpAction.ContactMethod_MobilePhone,
      $or: hierFilter
    });
    contactable.contactMethods.push({type: cellPhoneCM._id, value: data.cellPhone});
  }
  // Work phone contact method
  if (data.officePhone) {
    var workPhoneCM = LookUps.findOne({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: Enums.lookUpAction.ContactMethod_WorkPhone,
      $or: hierFilter
    });
    contactable.contactMethods.push({type: workPhoneCM._id, value: data.officePhone});
  }
  // Email contact method
  if (data.email) {
    var emailCM = LookUps.findOne({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: Enums.lookUpAction.ContactMethod_MobilePhone,
      $or: hierFilter
    });
    contactable.contactMethods.push({type: emailCM._id, value: data.email});
  }

  return contactable;
};

var importNotes = function (userId, apiHelper, type, aident, contactableId) {
  try {
    var result = apiHelper.post('/' + type + '/' + aident + '/messages', {});
    if (result) {
      // Insert each note
      _.each(result, function (twNote) {
        if (twNote.message) {
          var note = {
            msg: twNote.message,
            links: [{id: contactableId, type: Enums.linkTypes.contactable.value}],
            contactableId: contactableId,
            dateCreated: new Date(twNote.date),
            hierId: apiHelper.hierId,
            userId: userId,
            displayToEmployee: false
          };

          if (twNote.dateDue && Date.parse(twNote.dateDue)) {
            note.remindDate = new Date(twNote.dateDue);
          }

          // Insert note
          return Notes.insert(note);
        }
      });
    }
  } catch (ex) {
    console.log('Error importing notes for', type, aident, ex.message);
  }
};

var importTags = function (apiHelper, type, aident, contactableId) {
  try {
    var result = apiHelper.post('/' + type + '/' + aident + '/interestCodes', {});
    if (result) {
      // Insert tags
      var tags = _.map(result, function (tag) {
        return tag.interestCode;
      });
      Contactables.update({_id: contactableId}, {$set: {tags: tags}});
    }
  } catch (ex) {
    console.log('Error importing tags for', type, aident, ex.message);
  }
};
