Meteor.publish('lookUps', function () {
    return LookUps.find();
});

LookUps.allow({
  update: function(userId, doc) {
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId) == -1;
  }
});

Meteor.methods({
  addLookUpItem: function(item) {
    item.hierId = Meteor.user().hierId;
    LookUps.insert(item);
  }
})

