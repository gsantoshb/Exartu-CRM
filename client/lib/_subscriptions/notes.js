Notes = new Meteor.Collection("notes");
NotesHandler = Meteor.paginatedSubscribe('notes');