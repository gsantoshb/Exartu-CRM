
Migrations.add({
  version: 21,
  up: function() {
    // Remove the objType Customer
    dType.ObjTypes.remove({ name: 'Customer' });

    var count = 0;
    Contactables.find({Customer:{$exists:true}}, {fields: {objNameArray: 1, Customer: 1}}).forEach(function (c) {
      count++;
      console.log('updating client', count, '-', c._id);

      // Update contactable
      var client = _.clone(c.Customer);
      Contactables.update({_id: c._id}, {
        $set: { Client: client, objNameArray: ["organization", "contactable", "Client"] },
        $unset:{Customer:""}
      });
    });

    console.log('Finished migration 21');
  }
});
