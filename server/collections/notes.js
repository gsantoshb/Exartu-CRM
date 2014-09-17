Meteor.publish('notes', function () {
  if (!this.userId)
    return false;
  var user = Meteor.users.findOne({
        _id: this.userId
    });
  return Notes.find({
        $or: filterByHiers(user.currentHierId)
    });


})

Notes.allow({
  insert: function (userId, doc) {

    return true
  }
});

Notes.before.insert(function(userId, doc){
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
  return doc;
})

// indexes
Notes._ensureIndex({hierId: 1});
Notes._ensureIndex({assign: 1});
Notes._ensureIndex({userId: 1});
Notes._ensureIndex({"links._id":1});