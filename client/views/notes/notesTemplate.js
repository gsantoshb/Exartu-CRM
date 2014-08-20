var entityId=null;
var entityType=null;
Template.notesTemplate.created=function(id){
  if (this.data) entityId=this.data._id;
  entityType=Utils.getEntityTypeFromRouter();
}

var searchString, searchDep = new Deps.Dependency;
Template.notesTemplate.notes = function() {
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
  if (entityId!= null)
  {
    searchQuery.links= { $elemMatch: { id: entityId} } ;
  }
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
  },

  'click .addNote': function(){
    console.log('entityid note',entityId,entityType);
    if (entityId ==null) {
      Composer.showModal('addEditNote', { links: [
      ] })
    }
    else
    {
      Composer.showModal('addEditNote', { links: [
        {
          id: entityId,
          type: entityType
        }
      ] })
    }
  }
};

