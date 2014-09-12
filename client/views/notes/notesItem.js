var entityId=null;
var entityType=null;
Template.notesItem.created=function(id){
  if (this.data) entityId=this.data._id;
  entityType=Utils.getEntityTypeFromRouter();
}

var searchString, searchDep = new Deps.Dependency;
Template.notesItem.notes = function() {
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

Template.notesItem.getCount = function(notes) {
  return notes.count();
}

Template.notesItem.getEntity = function(link){
  return Utils.getEntityFromLink(link);
};

Template.notesItem.getUrl = function(link) {
  return Utils.getHrefFromLink(link);
};

Template.notesItem.formatMsg = function(msg) {
  return msg.replace(/\r?\n/g,'<br/>');
};

Template.notesItem.events = {
  'change #search-string': function(e) {
    searchString = e.currentTarget.value;
    searchDep.changed();
  },

  'click .addNote': function(){
    if (entityId ==null) {
      Composer.showModal('addEditNote', { links: [
      ] })
    }
    else
    {
      var links = [
        {
          id: entityId,
          type: entityType
        }
      ];

      if (entityType == Enums.linkTypes.placement.value) {
        // Add its employee, customer and job as links
        // Employee
        links.push({id: this.employee, type: Enums.linkTypes.contactable.value});
        // Customer
        links.push({id: this.customer, type: Enums.linkTypes.contactable.value});
        // Job
        links.push({id: this.job, type: Enums.linkTypes.job.value});
      }

      Composer.showModal('addEditNote', { links: links})
    }
  }
};

