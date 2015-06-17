NoteManager = {
  apiAddNote: function (note) {
    // Validation
    if (!note.msg) {
      throw new Error('Message is required');
    }
    if (!note.link) {
      throw new Error('Link is required');
    }

    var contactable = Contactables.findOne(note.link);
    if (!contactable)
      throw new Error('Contactable with id ' + note.link + 'not found');

    // Replace link for corresponding links
    note.links = [{id: note.link, type: Enums.linkTypes.contactable.value}];
    delete note.link;

    return Notes.insert(note);
  },

  apiGetNotes: function (entityId) {
    return Utils.filterCollectionByUserHier.call({userId: Meteor.userId()},
      Notes.find({'links.id': entityId}, {sort: {'dateCreated': -1}})).fetch();
  },
  addNote: function (note) {
    if (!note.msg) {
      throw new Error('Message is required');
    }
    if (note.links) {

      //check links
      var validLink = true;
      _.forEach(note.links, function (l) {
        if (l.type === Enums.linkTypes.contactable.value) {
          var contactable = Contactables.findOne({_id: l.id});
          validLink = validLink && (contactable != null);
        }
        else if (l.type === Enums.linkTypes.job.value) {
          var job = Jobs.findOne({_id: l.id});
          validLink = validLink && (job != null);
        }
        else if (l.type === Enums.linkTypes.deal.value) {
          var deal = Deals.findOne({_id: l.id});
          validLink = validLink && (deal != null);
        }
        else if (l.type === Enums.linkTypes.hotList.value) {
          var hotList = HotLists.findOne({_id: l.id});
          validLink = validLink && (hotList != null);
        }
        else if (l.type === Enums.linkTypes.placement.value) {
          var placement = Placements.findOne({_id: l.id});
          validLink = validLink && (placement != null);
        }
        else if(l.type === Enums.linkTypes.dashboard.value) {
          var user = Meteor.users.findOne({_id: l.id});
          validLink = validLink && (user != null);
        }
        else {
          validLink = false;
        }

      });
      //throw error if validLink is false
      if (!validLink) {
        throw new Error('Wrong link');
      }

    }

    //add hier and user id
    var user = Meteor.user();
    note.hierId = user.currentHierId;
    note.userId = user._id;

    return Notes.insert(note);

  },
  updateNote: function (note) {
    if (!note.msg) {
      throw new Error('Message is required');
    }
    if (note.links) {
      //check links
      var validLink = true;
      _.forEach(note.links, function (l) {
        if (l.type === Enums.linkTypes.contactable.value) {
          var contactable = Contactables.findOne({_id: l.id});
          validLink = validLink && (contactable != null);
        }
        else if (l.type === Enums.linkTypes.job.value) {
          var job = Jobs.findOne({_id: l.id});
          validLink = validLink && (job != null);
        }
        else if (l.type === Enums.linkTypes.deal.value) {
          var deal = Deals.findOne({_id: l.id});
          validLink = validLink && (deal != null);
        }
        else if (l.type === Enums.linkTypes.hotList.value) {
          var hotList = HotLists.findOne({_id: l.id});
          validLink = validLink && (hotList != null);
        }
        else if (l.type === Enums.linkTypes.placement.value) {
          var placement = Placements.findOne({_id: l.id});
          validLink = validLink && (placement != null);
        }
        else if(l.type === Enums.linkTypes.dashboard.value) {
          var user = Meteor.users.findOne({_id: l.id});
          validLink = validLink && (user != null);
        }
        else {
          validLink = false;
        }
      });
    }
    return Notes.update({_id:note._id},{$set: _.pick(note, 'msg', 'links') });
  },
  removeNote: function (id) {

    //we have to check if the user have the permissions to remove this note.
    return Notes.remove({_id:id});
  },
  getNotePreview: function(noteId){
    var note = Notes.findOne({_id:noteId});
    var linksInfo = [];
    _.forEach(note.links, function(l){
      switch(l.type){
        case Enums.linkTypes.contactable.value:{
          var c = Contactables.findOne({_id: l.id});
          var lInfo = {_id: c._id, displayName: c.displayName, objNameArray: c.objNameArray};
          if(c.contactMethods){
            _.extend(lInfo, {contactMethods: c.contactMethods});
          }
          linksInfo.push(lInfo);
          break;
        }
      }
    })
    return({_id: note._id, msg: note.msg, dateCreated: note.dateCreated, links: linksInfo});
  }
};

