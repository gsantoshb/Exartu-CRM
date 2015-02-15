Migrations.add({
  version: 12,
  up: function () {
    var hierarchiesId = Hierarchies.find().map(function (hier) { return hier._id; });

    _.forEach(hierarchiesId, function (hierId) {
      var statusCodes = [
        Enums.lookUpTypes.customer.status.lookUpCode,
        Enums.lookUpTypes.employee.status.lookUpCode,
        Enums.lookUpTypes.contact.status.lookUpCode,
        Enums.lookUpTypes.howHeardOf.type.lookUpCode,
          Enums.lookUpTypes.howHeardOf.type.lookUpCode,

      ];
      _.forEach(statusCodes, function (statusCode) {
        var status = {
          hierId: hierId,
          lookUpCode: statusCode,
          displayName: 'Deleted'
        };

        if (! LookUps.findOne(status)) {
          status.lookUpActions = [Enums.lookUpAction.Implies_Inactive]; // Set default actions
          LookUps.insert(status);
        }
      })
    });
  }
});