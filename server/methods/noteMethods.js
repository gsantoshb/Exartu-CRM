Meteor.methods({
  apiAddNote: function (note) {
    try {
      return NoteManager.apiAddNote(note);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  }
});
