Meteor.publish('jobRateTypes', function () {
  return Utils.filterCollectionByUserHier.call(this, JobRateTypes.find());
});