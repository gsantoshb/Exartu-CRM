Meteor.publish('messages', function () {
  // TODO: only publish message where current user is involved
  return Utils.filterCollectionByUserHier.call(this, Messages.find());
});

Messages.allow({
  update: function (userId, doc) {
    return doc.from == Meteor.userId() || doc.destination == Meteor.userId();
  }
});

Meteor.publish('conversations', function () {
  return Conversations.find({
    $or: [{
        user1: this.userId
      },{
        user2: this.userId
      }
    ]
  })
});

Conversations.allow({
  update: function (userId, doc) {
    return doc.user1 == userId || doc.user2 == userId;
  }
});

Messages.before.insert(function (userId, doc) {
  doc.dateCreated = Date.now();
});

Conversations.before.insert(function (userId, doc) {
  doc.dateCreated = Date.now();
});

// Indexes

Messages._ensureIndex({conversationId: 1});
