
Migrations.add({
  version: 36,
  up: function () {
    Hierarchies.find({parent: {$exists: false}}, {fields: {_id: 1}}).forEach(function (hier) {
      if (hier._id != ExartuConfig.TenantId) {
        console.log('Inserting emergency phone in hier', hier._id);

        LookUps.insert({
          displayName: 'Emergency Phone',
          lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
          lookUpActions: [Enums.lookUpAction.ContactMethod_Phone, Enums.lookUpAction.ContactMethod_EmergencyPhone],
          hierId: hier._id
        });
      }
    });

    console.log('Finished migration 36');
  }
});
