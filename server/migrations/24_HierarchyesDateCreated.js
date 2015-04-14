/**
 * Created by ramiro on 14/04/15.
 */

Migrations.add({
  version: 24,
  up: function () {
    var hierCursor = Hierarchies.find({});
    hierCursor.forEach(function (hier) {
       Hierarchies.update({_id: hier._id}, {$set: {dateCreated: new Date(hier.dateCreated)}});
    });
  }
});
