NotesController = RouteController.extend({
  template: 'notes',
  layoutTemplate: 'mainLayout',
  onAfterAction: function() {
    var title = 'Notes',
    description = 'Manage your notes here';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

var searchString, searchDep = new Deps.Dependency;
Template.notes.notes = function() {
  searchDep.depend();
  searchQuery = {};

  if (!_.isEmpty(searchString)) {
    var searchStringQuery = [];
    _.each([
      'msg',
    ], function (field) {
      var aux = {};
      aux[field] = {
          $regex: searchString,
          $options: 'i'
      };
      searchStringQuery.push(aux);
    });
    searchQuery.$or =  searchStringQuery;
  }

  return Notes.find(searchQuery,
      {
          sort:
            {
              dateCreated: -1
            }
      });
};

Template.notes.getCount = function(notes) {
  return NotesHandler.totalCount();
}

Template.notes.getEntity = function(link){
  return Utils.getEntityFromLink(link);
};

Template.notes.getUrl = function(link) {
  return Utils.getHrefFromLink(link);
};

Template.notes.events = {
  'change #search-string': function(e) {
    searchString = e.currentTarget.value;
    searchDep.changed();
  }
};