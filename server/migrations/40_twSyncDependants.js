
Migrations.add({
  version: 40,
  up: function () {
    Hierarchies.find({enterpriseAccount: {$exists: true}}).forEach(function (hier) {
      console.log('migrating hier: ', hier._id, ' - ', hier.name);

      // Set up account info for the helper
      var accountInfo = {
        hierId: hier._id,
        username: hier.enterpriseAccount.username,
        password: hier.enterpriseAccount.password,
        accessToken: hier.enterpriseAccount.accessToken,
        tokenType: hier.enterpriseAccount.tokenType
      };
      var apiHelper = new TwApiHelper(accountInfo);

      // Get the employees synced with Enterprise that have a dependant number set
      Contactables.find({hierId: hier._id, externalId: {$exists: true}, 'Employee.dependentNumber': {$gt: 0}}).forEach(function (emp) {
        console.log('migrating employee: ', emp._id, ' - ', emp.person.firstName, emp.person.lastName);

        // Sync the information
        var dependants = {dependantsCount: emp.Employee.dependentNumber};
        apiHelper.post('/Employees/' + emp._id + '/setDependants', dependants, Meteor.bindEnvironment(function (error, result) {
          if (error) {
            throw new Error("Failed updating dependants for employee " + emp._id);
          }
        }));
      });
    });

    console.log('finished migration 40');
  }
});
