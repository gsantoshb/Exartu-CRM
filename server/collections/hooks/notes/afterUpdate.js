
// Contactables View
Notes.after.update(function (userId, note, fieldNames, modifier) {
  // todo: check if links are edited

  if (modifier.$set && modifier.$set.msg) {
    _.each(note.links, function (link) {
      if (link.type == Enums.linkTypes.contactable.value) {
        ContactablesView.update(link.id, {$set: {'lastNote.msg': note.msg}});
      }
    })
  }
});


// Notes View
Notes.after.update(function (userId, doc, fields, update) {
  var newLinks = [];
  if (doc.links && (doc.links.length > 0)) {
    _.each(doc.links, function (l) {
      switch (l.type) {
        case Enums.linkTypes.contactable.value:
        {
          var c = Contactables.findOne({_id: l.id});
          if (c && c.person) {
            newLinks.push({
              type: Enums.linkTypes.contactable.value,
              id: l.id,
              displayName: c.person.lastName + ", " + c.person.firstName + " " + c.person.middleName
            });
          }
          else if (c && c.organization) {
            newLinks.push({
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
          if (j) newLinks.push({type: Enums.linkTypes.job.value, id: l.id, displayName: j.displayName});
          break;
        }
        case Enums.linkTypes.placement.value:
        {
          var p = Placements.findOne({_id: l.id});
          if (p) newLinks.push({type: Enums.linkTypes.placement.value, id: l.id, displayName: p.displayName});
          break;
        }
        case Enums.linkTypes.hotList.value:
        {
          var h = HotLists.findOne({_id: l.id});
          if (h) newLinks.push({type: Enums.linkTypes.hotList.value, id: l.id, displayName: h.displayName});
          break;
        }
      }
    })
  }

  var newNote = {};
  newNote._id = doc._id;
  newNote.msg = doc.msg;
  newNote.links = newLinks;
  newNote.hierId = doc.hierId;
  newNote.userId = doc.userId;
  newNote.dateCreated = doc.dateCreated;
  newNote.remindDate = doc.remindDate;
  NotesView.update({_id: newNote._id}, newNote);
});
