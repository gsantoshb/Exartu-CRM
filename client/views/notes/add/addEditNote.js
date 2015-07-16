var note = new ReactiveVar();
var currentUrl;
var noteId;
var links;
var pushDays = 0;
var showRemindDate = new ReactiveVar(false);
var updatingRemindDate = new ReactiveVar(false);
var addDisabled = new ReactiveVar(false);
var clickedCheckboxOrButton = false;
var detectedSpan = new ReactiveVar();
var text = new ReactiveVar('');
var unsetRemindDate = false;

var getMatchingTimeSpan = function (text) {
  var result;
  _.any(timeSpanDictionary, function (span, key) {
    if (span.regex.test(text)) {
      result = span;
      return true;
    }
  });
  return result;
};

var setSelectedTimeSpan = function (newVal) {
  //hack to force dateTimePicker to re-render with the new value
  if (detectedSpan.curValue != newVal){
    updatingRemindDate.set(true);
    setTimeout(function () {
      updatingRemindDate.set(false);
    }, 100);
  }

  detectedSpan.set(newVal);
};
//
//var timeSpanDictionary = {
//  later: {
//    regex: /\b(later|later\stoday|today)\b/i,
//    label: 'In two hours',
//    getTime: function () {
//      return moment().add(2, 'h').toDate();
//    }
//  },
//  tomorrow: {
//    regex: /\b(tomorrow)\b/i,
//    label: 'Tomorrow',
//    getTime: function () {
//      return moment().add(1, 'd').toDate();
//    }
//  },
//  nextDays: {
//    regex: /\b(next\sdays|couple\sof\sdays|soon)\b/i,
//    label: 'In two days',
//    getTime: function () {
//      return moment().add(2, 'd').toDate();
//    }
//  },
//  nextWeek: {
//    regex: /\b(next\sweek\b)/i,
//    label: 'Next week',
//    getTime: function () {
//      return moment().add(1, 'w').toDate();
//    }
//  }
//};

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
    if(note.get() && note.get().remindDate){
      return note.get().remindDate;
    }
    else if( detectedSpan.get()){
      return  detectedSpan.get().getTime();
    }
  },
  showRemindDate: function(){
    return showRemindDate.get() || (note.get() && note.get().remindDate);
  },
  isEditing: function(){
    return note.get();
  },
  timeSpans: function () {
    return _.toArray(timeSpanDictionary);
  },
  updatingRemindDate: function () {
    return updatingRemindDate.get();
  },
  isSelectedSpan: function () {
    return this == detectedSpan.get();
  },
  containRemaindDate: function(){
    if(note.get() && note.get().remindDate){
      return note.get().remindDate;
    }
    else{
      return false;
    }
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
  },
  'change #show-remind-date-checkbox': function (e, ctx) {
    clickedCheckboxOrButton = true;
    showRemindDate.set(e.target.checked);

    // default to 'next weeks'
    if (e.target.checked && !detectedSpan.get()){
      detectedSpan.set(timeSpanDictionary.nextWeek);
    }

    if(!e.target.checked){
      if(note.get()) {
        var newNote = note.get();
        newNote.remindDate = undefined;
        note.set(newNote);
      }
    }

  },
  'click .time-span': function () {
    clickedCheckboxOrButton = true;
    setSelectedTimeSpan(this);
  },
  'keyup #noteMsg': function (e, ctx) {
    text.set(e.target.value);
  },
  'click .completed-note': function(){
    unsetRemindDate = true;
  }
})

Template.addEditNote.created = function () {
  unsetRemindDate = false;
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
  Meteor.autorun(function () {
    // if the user selected a time span or clicked the checkbox then i don't have to find a span in the text
    if (clickedCheckboxOrButton)
      return;
    var s = getMatchingTimeSpan(text.get());
    setSelectedTimeSpan(s);
    showRemindDate.set(!! s);
  })
};

Template.addEditNote.destroyed = function () {
  if (currentUrl === window.location.pathname) {
    history.replaceState(null, 'edit', '/notes');
  }
  else {
    history.replaceState(null, 'edit', currentUrl);
  }
  text.set('');
  showRemindDate.set(false);
  detectedSpan.set(undefined);
  clickedCheckboxOrButton = false;

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
        if(unsetRemindDate){
          insertDoc.remindDate = null;
          showRemindDate.set(false);
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