var entityType = null;
var isEntitySpecific = false;
var NotesHandler, noteQuery, status;

$("#userDropdown").prop("selectedIndex", -1);
var loadNoteQueryFromURL = function (params) {
  // Search string
  var searchStringQuery = {};
  if (params.search) {
    searchStringQuery.default = params.search;
  }

  var userIdQuery = {};
  if (params.userId) {
    userIdQuery.default = params.userId;
  }

  return new Utils.ObjectDefinition({
    reactiveProps: {
      searchString: searchStringQuery,
      userId: userIdQuery
    }
  });
};
var options = {};

var noteCount = new ReactiveVar();

Template.notesBox.created = function () {
  noteQuery = noteQuery || loadNoteQueryFromURL(Router.current().params);
  var entityId = Session.get('entityId');

  if (!SubscriptionHandlers.NotesHandler) {
    SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe("notes");
  }
  NotesHandler = SubscriptionHandlers.NotesHandler;

  entityType = Utils.getEntityTypeFromRouter();
  isEntitySpecific = false;
  if (entityType != null) isEntitySpecific = true;

  Meteor.autorun(function () {

    var urlQuery = new URLQuery();

    var queryObj = noteQuery.getObject();
    var q = {};

    if (queryObj.userId) {
      q.userId = queryObj.userId;
      urlQuery.addParam('userId', queryObj.userId);
    }

    if (queryObj.searchString) {
      q.msg = {
        $regex: queryObj.searchString,
        $options: 'i'
      };
      urlQuery.addParam('search', queryObj.searchString);
    }
    //console.log('ent spec note',entityId,q, q.msg);
    if (isEntitySpecific) {
      q.links = {$elemMatch: {id: entityId}};
    }
    urlQuery.apply();
    if (selectedSort.get()) {
      var selected = selectedSort.get();
      options.sort = {};
      options.sort[selected.field] = selected.value;
    } else {
      delete options.sort;
    }
    NotesHandler.setFilter(q);    
    NotesHandler.setOptions(options);
    


  })
};


Template.notesBox.helpers({
  noteCount: function () {
    return NotesHandler.totalCount();
  },
  users: function () {
    return Meteor.users.find();
  },
  notes: function () {
    return Notes.find();
  },
  filters: function () {
    return noteQuery;
  },
  selectedClass: function () {
    statusDep.depend();
    return this == status ? 'btn-primary' : 'btn-default';
  },
  isLoading: function () {
    return NotesHandler.isLoading();
  }
});

Template.notesBox.events({
  'click .addNote': function () {
    if (!isEntitySpecific)
      Utils.showModal('addEditNote');
    else
      Utils.showModal('addEditNote', {
        links: [{
          id: Session.get('entityId'),
          type: entityType
        }]
      })
  }
});
// list sort

var selectedSort =  new ReactiveVar();
selectedSort.field='dateCreated';
selectedSort.value=-1;
var sortFields = [
  {field: 'dateCreated', displayName: 'Date'},
];

Template.noteListSort.helpers({
  sortFields: function() {
    return sortFields;
  },
  selectedSort: function() {
    return selectedSort.get();
  },
  isFieldSelected: function(field) {
    return selectedSort.get() && selectedSort.get().field == field.field;
  },
  isAscSort: function() {
    return selectedSort.get() ? selectedSort.get().value == 1: false;
  }
});

var setSortField = function(field) {
  var selected = selectedSort.get();
  if (selected && selected.field == field.field) {
    if (selected.value == 1)
      selected = undefined;
    else
      selected.value = 1;
  } else {
    selected = field;
    selected.value = -1;
  }
  selectedSort.set(selected);
};

Template.noteListSort.events = {
  'click .sort-field': function() {
    setSortField(this);
  }
};

