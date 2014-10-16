Meteor.paginatedPublish(Notes, function () {
  return Utils.filterCollectionByUserHier.call(this, Notes.find());
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