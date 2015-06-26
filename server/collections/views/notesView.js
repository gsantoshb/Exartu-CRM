Meteor.paginatedPublish(NotesView,
  function () {
    var user = Meteor.users.findOne({_id: this.userId});
    if (!user) return [];
    //console.log(PastJobLeads.find().fetch())
    return Utils.filterCollectionByUserHier.call(this, NotesView.find({},{sort:{dateCreated:-1}}));
  }, {
    pageSize: 10,
    publicationName: 'notesView'
  }
);

NotesView.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});


Placements.after.update(function(userId, doc, fields, update){
  if(update.$set && update.$set['displayName']){
    NotesView.update({"links.id":doc._id},{$set:{"links.$.displayName": doc.displayName}},{multi:true})
  }
})

HotLists.after.update(function(userId, doc, fields, update){
  if(update.$set && update.$set['displayName']){
    NotesView.update({"links.id":doc._id},{$set:{"links.$.displayName": doc.displayName}},{multi:true})
  }
})

NotesView._ensureIndex({dateCreated: 1});
//NotesView._ensureIndex({_id: 1});
