Meteor.publish('tasks', function () {
  return Utils.filterCollectionByUserHier.call(this, Tasks.find());
});

Tasks.allow({
  update: function () {
    return true;
  },
  insert: function () {
    return true;
  }
});

Tasks.before.insert(function (userId, doc) {
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
});

// Indexes

Tasks._ensureIndex({hierId: 1});
Tasks._ensureIndex({assign: 1});
Tasks._ensureIndex({userId: 1});