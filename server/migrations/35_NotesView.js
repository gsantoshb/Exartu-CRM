/**
 * Created by ramiro on 03/06/15.
 */
Migrations.add({
  version: 35,
  up: function () {
    var count = 0;
    Notes.find({}).forEach(function (note) {

      var n = NotesView.findOne({_id: note._id});
      if (!n) {
        count++;
        console.log('adding noteView ', count, '-', note._id);
        var newLinksArray = [];
        _.each(note.links, function (l) {
          switch (l.type) {
            case Enums.linkTypes.contactable.value:
            {
              var c = Contactables.findOne({_id: l.id});
              if (c && c.person) {
                newLinksArray.push({
                  type: Enums.linkTypes.contactable.value,
                  id: l.id,
                  displayName: c.person.lastName + ", " + c.person.firstName + " " + c.person.middleName
                });
              }
              else if (c && c.organization) {
                newLinksArray.push({
                  type: Enums.linkTypes.contactable.value,
                  id: l.id,
                  displayName: c.organization.organizationName
                });
              }
              break;
            }
            case Enums.linkTypes.job.value:
            {
              var j = Jobs.findOne({_id: l.id});
              if (j) {
                newLinksArray.push({type: Enums.linkTypes.job.value, id: l.id, displayName: j.displayName});
              }
              break;
            }
            case Enums.linkTypes.hotList.value:
            {
              var h = HotLists.findOne({_id: l.id});
              if (h) {
                newLinksArray.push({type: Enums.linkTypes.hotList.value, id: l.id, displayName: h.displayName});
              }
              break;
            }
            case Enums.linkTypes.placement.value:
            {
              var p = Placements.findOne({_id: l.id});
             if (p) {
               newLinksArray.push({type: Enums.linkTypes.placement.value, id: l.id, displayName: p.displayName});
             }
              break;
            }

          }
        });
        var newNote = {};
        newNote._id = note._id;
        newNote.msg = note.msg;
        newNote.links = newLinksArray;
        newNote.hierId = note.hierId;
        newNote.userId = note.userId;
        newNote.dateCreated = note.dateCreated;
        NotesView.insert(newNote);
      }
    });
    console.log('Finished migration 35');
  }
});
