Meteor.methods({
  apiAddNote: function (note) {
    try {
      return NoteManager.apiAddNote(note);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },
  apiGetNotes: function (entityId) {
    try {
      return NoteManager.apiGetNotes(entityId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },
  addNote: function (note) {
    try {
      NoteManager.addNote(note);
    }
    catch (err) {
      throw new Meteor.Error(err.message);
    }


  },
  updateNote: function (note) {
    try {
      NoteManager.updateNote(note);
    }
    catch (err) {
      throw new Meteor.Error(err.message);
    }

  },
  removeNote: function (id) {
    try {
      NoteManager.removeNote(id);
    }
    catch (err) {
      throw new Meteor.Error(err.message);
    }

  },
  getEntityFromLinkForAdd: function (link) {
    switch (link.type) {
      case Enums.linkTypes.contactable.value:
        return Contactables.findOne({_id: link.id}, {fields: {displayName: 1}});
      case Enums.linkTypes.job.value:
        return Jobs.findOne({_id: link.id}, {fields: {displayName: 1}});
      case Enums.linkTypes.deal.value:
        return Deals.findOne({_id: link.id}, {fields: {displayName: 1}});
      case Enums.linkTypes.placement.value:
        return Placements.findOne({_id: link.id}, {fields: {displayName: 1}});
      case Enums.linkTypes.hotList.value:
        return HotLists.findOne({_id: link.id}, {fields: {displayName: 1}});
    }
  },
  getNotePreview: function(noteId){
    return NoteManager.getNotePreview(noteId);
  }
});
