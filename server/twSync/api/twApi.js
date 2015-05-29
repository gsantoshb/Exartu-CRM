
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
