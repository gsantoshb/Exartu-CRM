
Meteor.methods({
  getContactableListCount: function () {
    return CollectionsManager.getContactableListCount(this.userId);
  }
});
