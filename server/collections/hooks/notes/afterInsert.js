
// Contactable latest notes
Notes.after.insert(function (userId, doc) {
  if (!doc.links) return;

  _.each(doc.links, function (link) {
    if (link.type == Enums.linkTypes.contactable.value) {
      var c = Contactables.findOne({_id: link.id});
      if (c) {
        if (!c.latestNotes) {
          c.latestNotes = [];
        }
        else if (c.latestNotes.length === 3) {
          c.latestNotes.shift();
        }
        c.latestNotes.push(doc);
        Contactables.update({_id: link.id}, {$set: {latestNotes: c.latestNotes}});
      }
    }
  });
});


// Activities
Notes.after.insert(function (userId, doc) {
  var obj = {
    msg: doc.msg,
    userId: userId || doc.userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.noteAdd,
    entityId: doc._id,
    links: _.map(doc.links, function (link) {
      return link.id;
    }),
    data: {dateCreated: new Date()}

  };

  if (doc && doc.testData) obj.testData = true;

  Activities.insert(obj);
});


// Contactables view
Notes.after.insert(function (userId, note) {
  _.each(note.links, function (link) {
    if (link.type == Enums.linkTypes.contactable.value) {
      ContactablesView.update(link.id, {
        $set: {
          lastNote: {
            userId: note.userId,
            msg: note.msg,
            dateCreated: note.dateCreated
          }
        }
      });
    }
  });
});


// Notes View
Notes.after.insert(function (userId, doc) {
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
  newNote.isReply = doc.isReply;
  NotesView.insert(newNote);
});


// TW Enterprise sync
Notes.after.insert(function (userId, note) {
  _.each(note.links, function (link) {
    if (link.type == Enums.linkTypes.contactable.value) {
      var contactable = Contactables.findOne(link.id, {fields: {_id: 1, hierId: 1, externalId: 1, Employee: 1, skipTwSync: 1}});

      // Skip contactables with the skip flag set
      if (contactable && !contactable.skipTwSync) {

        // Sync only when an account has been set up for the contactable hier and the contactable has been sync
        if (contactable && contactable.externalId) {
          var hier = Hierarchies.findOne(contactable.hierId);
          if (hier && hier.enterpriseAccount) {
            // Set up account info for the helper
            var accountInfo = {
              hierId: hier._id,
              username: hier.enterpriseAccount.username,
              password: hier.enterpriseAccount.password,
              accessToken: hier.enterpriseAccount.accessToken,
              tokenType: hier.enterpriseAccount.tokenType
            };

            var data = {};
            data.message = note.msg;

            // Sync the note depending on the type of contactable
            if (contactable.Employee) {
              data.aIdent = contactable.externalId;
              TwApi.addEmployeeNote(contactable.externalId, data, accountInfo);
            } else if (contactable.Client) {
              data.customerId = contactable.externalId;
              TwApi.addCustomerNote(contactable.externalId, data, accountInfo);
            } else if (contactable.Contact) {
              data.ID = contactable.externalId;
              TwApi.addContactNote(contactable.externalId, data, accountInfo);
            }
          }
        }
      }
    }
  });
});
