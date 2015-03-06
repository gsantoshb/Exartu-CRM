Meteor.methods({
  apiAddNote: function (note) {
    try {
      return NoteManager.apiAddNote(note);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  apiGetNotes: function(entityId) {
    try {
      return NoteManager.apiGetNotes(entityId);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  addNote: function(note){
    try {
      NoteManager.addNote(note);
    }
    catch(err){
      throw new Meteor.Error(err.message);
    }



  }
});
