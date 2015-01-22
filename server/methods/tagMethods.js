Meteor.methods({
  apiAddTag: function (tag) {
    try {
      return TagManager.apiAddTag(tag);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  apiGetTags: function(contactableId) {
    try {
      return TagManager.apiGetTags(contactableId);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  }
});

