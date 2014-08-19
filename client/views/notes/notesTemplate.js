

var searchString, searchDep = new Deps.Dependency;
Template.notesTemplate.notes = function() {
  searchDep.depend();
  searchQuery = {};

  if (!_.isEmpty(searchString)) {
    var searchStringQuery = [];
    _.each([
      'content',
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
    console.log('notes search');
  return Notes.find(searchQuery,
      {
          sort:
            {
              dateCreated: -1
            }
      });
};

Template.notesTemplate.getCount = function(notes) {
  return notes.count();
}

Template.notesTemplate.getEntity = function(link){
  return Utils.getEntityFromLink(link);
};

Template.notesTemplate.getUrl = function(link) {
  return Utils.getHrefFromLink(link);
};

Template.notesTemplate.events = {
  'change #search-string': function(e) {
    searchString = e.currentTarget.value;
    searchDep.changed();
  }
};