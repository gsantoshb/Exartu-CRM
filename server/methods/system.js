
Meteor.methods({
  getSystemHierarchies: function (query) {
    return SystemManager.getSystemHierarchies(query);
  }
});
