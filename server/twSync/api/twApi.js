
TwApi = {
  addEmployee: function (employeeId, employee, accountInfo) {
    var apiHelper = new TwApiHelper(accountInfo);
    apiHelper.post('/Employees/Insert', employee, Meteor.bindEnvironment(function (error, result) {
      if (!error) {
        Contactables.update({_id: employeeId}, {$set: {externalId: result.aident}});
      } else {
        throw new Error("TW Sync failed adding employee");
      }
    }));
  },
  updateEmployee: function (employeeId, employee, accountInfo) {
    var apiHelper = new TwApiHelper(accountInfo);
    // Obtain the external copy of the employee
    apiHelper.get('/Employees/' + employeeId, Meteor.bindEnvironment(function (error, result) {
      if (!error) {
        // Update the modified properties
        _.each(_.keys(employee), function (key) {
          result[key] = employee[key];
        });

        // Sync the changes
        apiHelper.post('/Employees/Update', result, Meteor.bindEnvironment(function (error, result) {
          if (error) {
            throw new Error("TW Sync failed updating employee");
          }
        }));
      } else {
        throw new Error("TW Sync failed updating employee");
      }
    }))
  },
  syncEmployees: function (accountInfo) {
    var apiHelper = new TwApiHelper(accountInfo);
    // Get Employees for this hierarchy with taxID/SSN that hasn't been synced yet
    Contactables.find({
      hierId: accountInfo.hierId,
      Employee: {$exists: true},
      'Employee.taxID': {$exists: true, $ne: ''},
      externalId: {$exists: false}
    }).forEach(function (employee) {
      try {
        // Check if the employee is already registered in Enterprise
        var result = apiHelper.post('/Employee/Search', {ssn: employee.Employee.taxID.replace('/-/g', '')});
        if (result.length > 0) {
          // Save the aident as the employee external ID
          Contactables.update({_id: employee._id}, {$set: {externalId: result[0].aident}});
        } else {
          // Insert the employee in Enterprise
          var empData = {
            firstName: employee.person.firstName,
            lastName: employee.person.lastName,
            ssn: employee.Employee.taxID.replace(/-/g,'')
          };

          // Insert employee in Enterprise
          try {
            var response = apiHelper.post('/Employees/Insert', empData);
            if (response.aident) {
              Contactables.update({_id: employee._id}, {$set: {externalId: response.aident}});
            }
          } catch (ex) {
            // Mark the sync failed
            Hierarchies.update({_id: accountInfo.hierId}, {$set: {
              'enterpriseAccount.empSync': false,
              'enterpriseAccount.empSyncError': "Sync Employees failed for employee " + employee._id
            }});

            // Throw the error
            throw new Error("TW Sync Employees failed adding employee " + employee._id);
          }
        }
      } catch (ex) {
        // Mark the sync failed
        Hierarchies.update({_id: accountInfo.hierId}, {$set: {
          'enterpriseAccount.empSync': false,
          'enterpriseAccount.empSyncError': "Sync Employees failed for employee " + employee._id
        }});

        // Throw the error
        throw new Error("Sync Employees failed for employee " + employee._id);
      }
    });

    // Mark the sync is over
    Hierarchies.update({_id: accountInfo.hierId}, {$unset: {'enterpriseAccount.empSync': ''}});
  }

  //addContact: function (contactId, contact) {
  //  HTTP.post('http://localhost:3000/twStubApi', {data: contact}, function (error, result) {
  //    if (!error) {
  //      var externalId = result.data.externalId;
  //      Contactables.update({_id: contactId}, {$set: {externalId: externalId}});
  //    }
  //  })
  //},
  //updateContact: function (contactId, contact) {
  //  HTTP.post('http://localhost:3000/twStubApi', {data: contact}, function (error, result) {
  //    if (!error) {
  //
  //    }
  //  })
  //},
  //
  //addClient: function (clientId, client) {
  //  HTTP.post('http://localhost:3000/twStubApi', {data: client}, function (error, result) {
  //    if (!error) {
  //      var externalId = result.data.externalId;
  //      Contactables.update({_id: clientId}, {$set: {externalId: externalId}});
  //    }
  //  })
  //},
  //updateClient: function (clientId, client) {
  //  HTTP.post('http://localhost:3000/twStubApi', {data: client}, function (error, result) {
  //    if (!error) {
  //
  //    }
  //  })
  //}
};
