
// Contactable latest notes
Notes.after.remove(function (userId, doc) {
  if (doc.links) {
    _.forEach(doc.links, function (link) {
      if (link.type == Enums.linkTypes.contactable.value) {
        //find last note
        var newLatestNote = [];
        var n = Notes.find({'links.id': link.id}, {$sort: {dateCreated: -1}}).fetch();
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
        Contactables.update({_id: link.id}, {$set: {latestNotes: newLatestNote}});
      }
    });
  }
});
