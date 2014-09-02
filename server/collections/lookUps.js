Meteor.publish('lookUps', function () {
  var user = Meteor.users.findOne({_id: this.userId});

  if(!user)
    return false;

   return LookUps.find({hierId: user.hierId},{sort: {displayName: 1}});
});

LookUps.allow({
  update: function(userId, doc) {
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId) == -1;
  },
  insert: function(userId, doc) {
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId) == -1;
  }
});

Meteor.methods({
  addLookUpItem: function(item) {
    item.hierId = Meteor.user().hierId;
    LookUps.insert(item);
  }
})

// indexes
LookUps._ensureIndex({hierId: 1});
LookUps._ensureIndex({lookUpCode: 1});