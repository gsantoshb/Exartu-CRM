NoteView = new View('notes', {
  collection: Notes,
  mapping: function(note) {
    var contactablesIds = [];
    var jobsIds = [];
    var dealsIds = [];
    var placementsIds = [];

    _.forEach(note.links, function(link){
      switch (link.type){
        case Enums.linkTypes.contactable.value:
          return contactablesIds.push(link.id);
        case Enums.linkTypes.job.value:
          return jobsIds.push(link.id);
        case Enums.linkTypes.deal.value:
          return dealsIds.push(link.id);
        case Enums.linkTypes.placement.value:
          return placementsIds.push(link.id);
        case Enums.linkTypes.candidate.value:
          return placementsIds.push(link.id);
      }
    });

    var cursors = [];
    if (! _.isEmpty(contactablesIds)){
      cursors.push(Contactables.find({_id: {$in: contactablesIds}}));
    }
    if (! _.isEmpty(jobsIds)){
      cursors.push(Jobs.find({_id: {$in: jobsIds}}));
    }
    if (! _.isEmpty(dealsIds)){
      cursors.push(Deals.find({_id: {$in: dealsIds}}));
    }
    if (! _.isEmpty(placementsIds)){
      cursors.push(Placements.find({_id: {$in: placementsIds}}));
    }
    return cursors;
  }
});

Meteor.paginatedPublish(NoteView, function () {
  return Utils.filterCollectionByUserHier.call(this, NoteView.find({},{ sort: { dateCreated: -1 } }));
},{
  pageSize: 3,
  publishName: 'notes'
});

Notes.allow({
  insert: function () {
    return true
  }
});

Notes.before.insert(function(userId, doc){
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
  return doc;
});

// Indexes

Notes._ensureIndex({hierId: 1});
Notes._ensureIndex({assign: 1});
Notes._ensureIndex({userId: 1});
Notes._ensureIndex({"links._id":1});