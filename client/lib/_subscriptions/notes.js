Notes = new Meteor.Collection("notes", {
  transform: function (note) {
    note.user = Meteor.users.findOne({
      _id: note.userId
    });
    note.contactables = _.map(note.contactables, function (contactableId) {
      return Meteor.Contactables.findOne({
        _id: contactableId
      });
    });
    return note;
  }
});
extendedSubscribe("notes", 'NotesHandler');