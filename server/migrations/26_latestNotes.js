
Migrations.add({
  version: 26,
  up: function () {
    var count = 0;

    Contactables.find({latestNotes: {$exists: false}}, {fields: {_id: 1}}).forEach(function (c) {
      count++;
      console.log('updating contactable', count, '-', c._id);

      var newLatestNote = [];
      var n = Notes.find({'links.id': c._id}, {$sort: {dateCreated: -1}, limit:3}).fetch();
      if (n) {
        if (n[2]) {
          newLatestNote.push(n[2]);
        }
        if (n[1]) {
          newLatestNote.push(n[1]);
        }
        if (n[0]) {
          newLatestNote.push(n[0]);
        }
      }

      // Update contactable latest notes
      Contactables.update({_id: c._id}, {$set: {latestNotes: newLatestNote}, $unset: {lastNote: ""}});
    });

    console.log('Finished migration 26');
  }
});
