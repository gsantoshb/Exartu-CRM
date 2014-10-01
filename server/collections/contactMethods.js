Meteor.publish('contactMethods', function () {
  return Utils.filterCollectionByUserHier.call(this, ContactMethods.find());
});