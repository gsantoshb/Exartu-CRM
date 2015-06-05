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


Notes.after.insert(function(userId,doc){

  var newLinks = [];
  if(doc.links && (doc.links.length >0)){
    _.each(doc.links, function(l){
          switch(l.type){
          case Enums.linkTypes.contactable.value:{
            var c = Contactables.findOne({_id: l.id});
            if(c.person) {
              newLinks.push({
                type: Enums.linkTypes.contactable.value,
                id: l.id,
                displayName: c.person.lastName + ", " + c.person.firstName + " " + c.person.middleName
              });
            }
            else if(c.organization){
              newLinks.push({
                type: Enums.linkTypes.contactable.value,
                id: l.id,
                displayName: c.organization.organizationName
              });
            }
            break;
          }
          case Enums.linkTypes.job.value:{
            var j = Jobs.findOne({_id: l.id});
            newLinks.push({type:Enums.linkTypes.job.value, id: l.id,displayName: j.displayName})
            break;
          }
          case Enums.linkTypes.placement.value:{
            var p = Placements.findOne({_id: l.id});
            newLinks.push({type:Enums.linkTypes.placement.value, id: l.id,displayName: p.displayName})
            break;
          }
          case Enums.linkTypes.hotList.value:{
            var h = HotLists.findOne({_id: l.id});
            newLinks.push({type:Enums.linkTypes.hotList.value, id: l.id,displayName: h.displayName})
            break;
          }
        }
    })
  }
  var newNote = {};
  newNote._id = doc._id;
  newNote.msg = doc.msg;
  newNote.links = newLinks;
  newNote.hierId = doc.hierId;
  newNote.userId = doc.userId;
  newNote.dateCreated = doc.dateCreated;
  NotesView.insert(newNote);
})

Notes.after.update(function(userId, doc, fields, update){
  var newLinks = [];
  if(doc.links && (doc.links.length >0)){
    _.each(doc.links, function(l){
      switch(l.type){
        case Enums.linkTypes.contactable.value:{
          var c = Contactables.findOne({_id: l.id});
          if(c.person) {
            newLinks.push({
              type: Enums.linkTypes.contactable.value,
              id: l.id,
              displayName: c.person.lastName + ", " + c.person.firstName + " " + c.person.middleName
            });
          }
          else if(c.organization){
            newLinks.push({
              type: Enums.linkTypes.contactable.value,
              id: l.id,
              displayName: c.organization.organizationName
            });
          }
          break;
        }
        case Enums.linkTypes.job.value:{
          var j = Jobs.findOne({_id: l.id});
          newLinks.push({type:Enums.linkTypes.job.value, id: l.id,displayName: j.displayName})
          break;
        }
        case Enums.linkTypes.placement.value:{
          var p = Placements.findOne({_id: l.id});
          newLinks.push({type:Enums.linkTypes.placement.value, id: l.id,displayName: p.displayName})
          break;
        }
        case Enums.linkTypes.hotList.value:{
          var h = HotLists.findOne({_id: l.id});
          newLinks.push({type:Enums.linkTypes.hotList.value, id: l.id,displayName: h.displayName})
          break;
        }
      }
    })
  }
  var newNote = {};
  newNote._id = doc._id;
  newNote.msg = doc.msg;
  newNote.links = newLinks;
  newNote.hierId = doc.hierId;
  newNote.userId = doc.userId;
  newNote.dateCreated = doc.dateCreated;
  NotesView.update({_id:newNote._id},newNote);
})

Contactables.after.update(function(userId, doc, fields, update){
  if(doc.person) {
    if (update.$set && (update.$set['person.lastName'] || update.$set['person.middleName'] || update.$set['person.lastName'])) {
      NotesView.update({"links.id": doc._id}, {$set: {"links.$.displayName": doc.person.lastName + ", " + doc.person.firstName + " " + doc.person.middleName}}, {multi: true})
    }
  }
  else if(doc.organization){
    console.log(update.$set);
    if (update.$set && (update.$set['organization.organizationName'])){
      NotesView.update({"links.id": doc._id}, {$set: {"links.$.displayName":doc.organization.organizationName}}, {multi: true})
    }
  }

})

Jobs.after.update(function(userId, doc, fields, update){
  if(update.$set && update.$set['publicJobTitle']){
    NotesView.update({"links.id":doc._id},{$set:{"links.$.displayName": doc.publicJobTitle}},{multi:true})
  }
})

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
