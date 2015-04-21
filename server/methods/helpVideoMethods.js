Meteor.methods({
  addUpdateHelpVideo: function (helpVideo) {
    var user = Meteor.user();
    if (!RoleManager.bUserIsSystemAdmin(user)){
      throw new Meteor.Error(401);
    }
    HelpVideoManager.addUpdate(helpVideo)
  },
  removeHelpVideo: function (id) {
    var user = Meteor.user();
    if (!RoleManager.bUserIsSystemAdmin(user)){
      throw new Meteor.Error(401);
    }
    HelpVideoManager.remove(id)

  }
});