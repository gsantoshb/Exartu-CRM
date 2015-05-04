Meteor.methods({
  saveMailChimpConfiguration: function (apikey) {
    var user = Meteor.user();
    if (!user) return;
    try{
      MailChimpManager.saveConfiguration(apikey, user.currentHierId);
    }catch (e){
      throw new Meteor.Error(e.message);
    }
  },
  getMailChimpLists: function () {
    var user = Meteor.user();
    if (!user) return;
    return MailChimpManager.getLists(user.currentHierId);
  },
  getSubscribers:function (listId) {
    var user = Meteor.user();
    if (!user) return;
    return  MailChimpManager.getSubscribers(user.currentHierId, listId);
  },
  importFromMailchimp:function (listId) {
    var user = Meteor.user();
    if (!user) return;
    return  MailChimpManager.importContacts(user.currentHierId, listId);
  }
});

