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
        else {
          validLink = false;
        }

      });
      //throw error if validLink is false
      if (!validLink) {
        throw new Error('Wrong link');
      }

    }
    //check hierarchy
    if (!note.hierId) {
      throw new Error('Hierarchy is required');
    }
    else {
      var hier = Hierarchies.findOne({_id: note.hierId});
      if (!hier) {
        throw new Error('Hierarchy is wrong');
      }
    }
    //check userId
    if (!note.userId) {
      throw new Error('UserId is required');
    }
    else {
      var user = Meteor.users.findOne({_id: note.userId});
      if (!user) {
        throw new Error("Wrong userId");
      }
    }
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
        else {
          validLink = false;
        }

      });
      //throw error if validLink is false
      if (!validLink) {
        throw new Error('Wrong link');
      }

    }
    //check hierarchy
    if (!note.hierId) {
      throw new Error('Hierarchy is required');
    }
    else {
      var hier = Hierarchies.findOne({_id: note.hierId});
      if (!hier) {
        throw new Error('Hierarchy is wrong');
      }
    }
    //check userId
    if (!note.userId) {
      throw new Error('UserId is required');
    }
    else {
      var user = Meteor.users.findOne({_id: note.userId});
      if (!user) {
        throw new Error("Wrong userId");
      }
    }
    return Notes.update({_id:note._id},{$set:{msg: note.msg, links: note.links}});
  },
  removeNote: function (id) {

    //we have to check if the user have the permissions to remove this note.
    return Notes.remove({_id:id});
  }
};

