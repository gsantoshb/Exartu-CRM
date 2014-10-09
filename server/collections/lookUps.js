Meteor.publish('lookUps', function () {
  return Utils.filterCollectionByUserHier.call(this, LookUps.find({hierId: {$ne:ExartuConfig.SystemHierarchyId}}, {sort: {displayName: 1}}));
});

LookUps.allow({
  update: function(userId, doc) {
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId) == -1;
  },
  insert: function(userId, doc) {
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId) == -1;
  }
});

// Indexes

LookUps._ensureIndex({hierId: 1});
LookUps._ensureIndex({lookUpCode: 1});