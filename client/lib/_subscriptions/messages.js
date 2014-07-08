Messages = new Meteor.Collection("messages");
extendedSubscribe('messages', 'MessagesHandler');

Conversations = new Meteor.Collection("conversations", {
  transform: function (conversation) {
    var conversationMessages = Messages.find({
      conversationId: conversation._id
    }).fetch();

    var unreadMessages = (!_.isEmpty(conversationMessages) &&
      _.every(conversationMessages, function (conversation) {
        return conversation.read;
      })
      );

    conversation.read = (conversation.user1 == Meteor.userId() ? conversation.user1Read : conversation.user2Read);

    return conversation;
  }
});
extendedSubscribe('conversations', 'conversationsHandler');