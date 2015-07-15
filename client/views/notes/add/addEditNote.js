var note = new ReactiveVar();
var currentUrl;
var noteId;
var links;
var pushDays = 0;

var addDisabled = new ReactiveVar(false);

Template.addEditNote.helpers({
  addDisabled: function () {
    return addDisabled.get();
  },
  schema: function () {
    return NoteAddEditSchema;
  },
  getNote: function () {
    if (note.get()){
      return note.get();
    }
    if (noteId){
      return EditNote.findOne(noteId);
    }
    return {
      msg:''
    };
  },
  remindDate: function () {
  // Use either the task begin date or a new date
  return note.get() ? note.get().remindDate : "";
  }
});

Template.addEditNote.events({
  'click .pushOneDay': function () {
    pushDays = 1;
  },
  'click .pushOneWeek': function () {
    pushDays = 7;
  },
  'click .pushOneMonth': function () {
    pushDays = 30;
  },
  'click .save-note': function(){
    pushDays = 0;
  }
})

Template.addEditNote.created = function () {
  var self = this;
  currentUrl = window.location.pathname;

  var param = this.data[0];
  if (_.isObject(param) && param._id){
    noteId = param._id;
    note.set(param);
  }else {
    noteId = null;
    note.set(null);
  }
  if (_.isObject(param) && param.links){
    links = param.links;
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
        if(pushDays>0){
          if(insertDoc.remindDate){
            insertDoc.remindDate.setDate(insertDoc.remindDate.getDate() + pushDays);
          }
          else{
            insertDoc.remindDate.setDate(new Date() + pushDays);
          }
        }

        var cb = function (err, res) {
          $('.modal-host').children().modal('toggle');
          self.done(err);
          addDisabled.set(false);
        };
        if (noteId) {
          insertDoc._id = noteId;
          Meteor.call('updateNote', insertDoc, cb);
        } else {
          insertDoc.links = links || [];
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