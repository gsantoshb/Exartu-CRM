Meteor.methods({
  searchActivities: function (searchString) {
    return ActivityManager.searchActivities(searchString);
  }
});