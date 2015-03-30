var note;
var Error = {};
var currentUrl;
var param;
var singleNoteHandler;

var typeDep = new Tracker.Dependency();
var linkedDep = new Tracker.Dependency();
var link = function (link) {
  if (_.findWhere(note.links, {
      id: link.id
    }))
    return;

  note.links.push(link);
};
var noteDep = new Tracker.Dependency;
var errorDep = new Tracker.Dependency;
var addDisabled = new ReactiveVar(false);
//
//var noteUpdate = function (cb) {
//  if (note._id) {
    //hacer el update a mano

    //Notes.update({
    //        _id: note._id
    //    }, {
    //        $set: {
    //            msg: note.msg,
    //            links: note.links
    //        }
    //    },
    //    function () {
    //        if (cb)
    //            cb();
    //    }
    //);
//    debugger;
//    Meteor.call('updateNote', note);
//  }
//};


var createNote = function (note) {
  addDisabled.set(false);
  var note = note || {};
  var definition = {
    msg: note.msg,
    links: note.links || [],
    hierId: note.hierId,
    userId: note.userId
//    reactiveProps: {}
  };
  if (note._id)
    definition._id = note._id;
  return definition;
//  return new Utils.ObjectDefinition(definition);
};

Template.addEditNote.helpers({
  addDisabled: function () {
    return addDisabled.get();
  },
  isEditing: function () {
    return !!note._id;
  },
  note: function () {
    noteDep.depend();
    return note;
  },
  users: function () {
    return Meteor.users.find({});
  },
  isSelected: function () {
    return _.contains(note.assign, this._id);
  },
  error: function () {
    errorDep.depend();
    return Error;
  },
  hasError: function (key) {
    errorDep.depend();
    return Error[key] ? 'error' : '';
  },
  types: function () {
    return _.map(_.filter(_.keys(Enums.linkTypes), function (key) {
      return !_.contains(['deal', 'candidate'], key);
    }), function (key) {
      return Enums.linkTypes[key];
    });
  },
  entities: function () {
    typeDep.depend();
    var selectedType = $('#noteTypeSelect').val();
    selectedType = parseInt(selectedType);
    switch (selectedType) {
      case Enums.linkTypes.contactable.value:
        return AllContactables.find({}, {
          sort: {
            displayName: -1
          }
        });
      case Enums.linkTypes.job.value:
        return AllJobs.find({}, {
          sort: {
            'displayName': -1
          }
        });
      case Enums.linkTypes.placement.value:
        return AllPlacements.find();
      default :
        return [];
    }
  },
  linkedEntities: function () {
    linkedDep.depend();
    return note.links;
  },
  getEntity: Utils.getEntityFromLinkForAdd,
  datepickerOptions: function () {
    return {
      format: 'D, MM dd, yyyy hh:ii',
      momentFormat: 'ddd, MMMM DD, YYYY HH:mm'
    };
  }
});

var isValid = function (note, key) {
  var result = true;

  if (key) {
    if (key == 'msg') {
      if (!note.msg) {
        Error.msg = 'This field is required';
        result = false;
      } else {
        Error.msg = '';
      }
    }
  }
  else {
    if (!note.msg) {
      Error.msg = 'This field is required';
      result = false;
    } else {
      Error.msg = '';
    }
  }
  errorDep.changed();
  return result;
};

Template.addEditNote.events({
  'click .accept': function () {
    if (!isValid(note)) {
      return;
    }


    // disable the button while processing


    if (note._id) {
      addDisabled.set(true);
      Meteor.call('updateNote', note, function(err, res){
        $('.modal-host').children().modal('toggle');
        addDisabled.set(false);
      });

    } else {
      //Notes.insert(note, function () {
      //    $('.modal-host').children().modal('toggle')
      //})
      note.hierId = Meteor.user().currentHierId;
      note.userId = Meteor.user()._id;
      addDisabled.set(true);
      Meteor.call('addNote', note, function () {
        $('.modal-host').children().modal('toggle');
        addDisabled.set(false);
      });

    }


  },

  'change .msg': function (e) {
    note.msg = e.target.value;
    //noteUpdate();
  },

  'blur .msg': function () {
    isValid(note, 'msg');
  }

  ,


  'change #noteTypeSelect': function () {
    typeDep.changed();
  }

  //,
  //'click #noteLinkEntity': function () {
  //  var type = $('#noteTypeSelect').val();
  //  type = parseInt(type);
  //  var entity = $('#noteEntitySelect').val();
  //  if (!_.isNumber(type) || !entity) return;
  //
  //  link({
  //    type: type,
  //    id: entity
  //  });
  //  linkedDep.changed();
  //  //esto no tendria que estar?
  //  noteUpdate();
  //}

  ,
  'click .remove-link': function () {
    var item = _(note.links).findWhere({id: this._id})

    note.links = _(note.links).without(item);
    linkedDep.changed();
    noteUpdate();
  }
});

Template.addEditNote.created = function () {
  Meteor.subscribe('allContactables');
  Meteor.subscribe('allJobs');
  Meteor.subscribe('allPlacements');
  Meteor.subscribe('allNotes');
  currentUrl = window.location.pathname;
  note = null;
  param = null;
  param = this.data[0];


  if ((typeof param) === "object") {

    note = createNote(param);
    if (param._id) {
      var url = '/notes/' + param._id;
    }
    else {
      var url = '/notes/';
    }
    //hack, there is a bug in replaceState/notes/ironRoute
    setTimeout(function () {
      window.history.replaceState(null, null, url)
    }, 500);

    noteDep.changed()
  }
  else if ((typeof param) === "string") {
    if (singleNoteHandler) {
      singleNoteHandler.stop();
    }
    singleNoteHandler = Meteor.subscribe("editNote", param, function () {
      if (EditNote.find({}).count() < 1) {
        noteDep.changed()
        return;
      }
      else {
        param = EditNote.findOne({});
        note = createNote(param);
        noteDep.changed()

      }
    });
  }
  else {
    note = createNote();
    noteDep.changed()
  }
  ;
}

Template.addEditNote.destroyed = function () {
  if (singleNoteHandler) {
    singleNoteHandler.stop();
    singleNoteHandler = null;
  }
  if (currentUrl === window.location.pathname) {
    history.replaceState(null, 'edit', '/notes');
  }
  else {
    history.replaceState(null, 'edit', currentUrl);
  }


};

