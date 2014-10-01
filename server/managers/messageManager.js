MessageManager = {
  createConversation: function (conversation) {
    conversation.user1 = Meteor.userId();
    return Conversations.insert({
      user1: conversation.user1,
      user2: conversation.user2,
      subject: conversation.subject,
      user1Read: true,
      user2Read: false,
    });
  },
  createMessage: function (message) {
    // validations
    var user = Meteor.user();
    if (user == null)
      throw new Meteor.Error(401, "Please sign in");

    if (typeof message.content != typeof '' || message.content == '')
      throw new Meteor.Error(400, "Invalid message content");


    var conversation = Conversations.findOne({
      _id: message.conversationId
    });
    message.read = false;
    message.from = conversation.user1 == message.destination ? conversation.user2 : conversation.user1;

    return Messages.insert(message);
  },
  markConversationMessagesAsRead: function (conversationId) {
    var conversationMessages = Messages.find({
      conversationId: conversationId
    }).fetch();

    var messageIds = _.map(conversationMessages, function (message) {
      return message._id
    });
    Messages.update({
      _id: {
        $in: messageIds
      }
    }, {
      $set: {
        read: true
      }
    }, {
      multi: true
    });
  },
  deleteConversation: function (conversationId) {
    Messages.remove({
      conversationId: conversationId
    });
    Conversations.remove({
      _id: conversationId
    });
  }
};