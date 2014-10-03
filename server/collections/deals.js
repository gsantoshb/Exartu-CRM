Meteor.publish('deals', function () {
  return Utils.filterCollectionByUserHier.call(this, Deals.find());
});

Deals.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Deals.before.insert(function (userId, doc) {
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
});