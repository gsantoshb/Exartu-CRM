var note;
var currentUrl;
var noteId;

var addDisabled = new ReactiveVar(false);

Template.addEditNote.helpers({
  addDisabled: function () {
    return addDisabled.get();
  },
  schema: function () {
    return NoteAddEditSchema;
  },
  getNote: function () {
    if (note){
      return note;
    }
    if (noteId){
      return EditNote.findOne(noteId);
    }
    return null;
  }
});

Template.addEditNote.created = function () {
  var self = this;
  currentUrl = window.location.pathname;

  var param = this.data[0];
  if (_.isObject(param)){
    noteId = param._id;
    note = param;
  }
  if (_.isString(param)){
    noteId = param;
    self.subscribe("editNote", param, function () {});
  }

  if ((typeof param) === "object") {
    var url;
    if (param._id) {
      url = '/notes/' + param._id;
    } else {
      url = '/notes/';
    }
    //hack, there is a bug in replaceState/notes/ironRoute
    setTimeout(function () {
      window.history.replaceState(null, null, url)
    }, 500);
  }
};

Template.addEditNote.destroyed = function () {
  if (currentUrl === window.location.pathname) {
    history.replaceState(null, 'edit', '/notes');
  }
  else {
    history.replaceState(null, 'edit', currentUrl);
  }
};

AutoForm.hooks({
  addEditNoteForm: {
    onSubmit: function(insertDoc) {
      var self = this;
      try {
        // Clean schema for auto and default values
        NoteAddEditSchema.clean(insertDoc);

        addDisabled.set(true);
        var cb = function (err, res) {
          $('.modal-host').children().modal('toggle');
          self.done(err);
          addDisabled.set(false);
        };

        if (noteId) {
          insertDoc._id = noteId;
          Meteor.call('updateNote', insertDoc, cb);
        } else {
          insertDoc.links = [];
          Meteor.call('addNote', insertDoc, cb);
        }
      } catch (e){
        console.log(e);
        addDisabled.set(false);
      }
      return false;
    }
  }
});