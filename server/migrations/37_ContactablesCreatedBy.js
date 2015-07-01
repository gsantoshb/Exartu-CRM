
Migrations.add({
  version: 37,
  up: function () {
    var count = 0;
    Contactables.find({createdBy: {$exists: false}}, {fields: {_id: 1, userId: 1}}).forEach(function (contactable) {
      Contactables.update(contactable._id, {$set: {createdBy: contactable.userId}});
      count++;
    });

    console.log('Finished migration 37, ' + count + ' contactables updated');
  }
});
