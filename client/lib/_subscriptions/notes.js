Notes = new Meteor.Collection("notes");
EditNote = new Mongo.Collection("editNote");
NoteList = new Mongo.Collection("noteList");
NotesView = new Mongo.Collection("notesView");

CalendarNotes = new Mongo.Collection("calendarNotes"
  ,
  {
    transform: function (note) {
      note.user = Meteor.users.findOne({
        _id: note.userId
      });
      note.state = Utils.classifyNote(note);
      return note
    }
  }
);
