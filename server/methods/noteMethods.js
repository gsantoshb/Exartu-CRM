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



  },
  updateNote: function(note){
    try{
      NoteManager.updateNote(note);
    }
    catch(err){
      throw new Meteor.Error(err.message);
    }

  },
  removeNote: function(id){
    try{
      NoteManager.removeNote(id);
    }
    catch(err){
      throw new Meteor.Error(err.message);
    }

  }
});
