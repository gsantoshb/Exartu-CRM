Meteor.methods({
  createConversation: function (conversation) {
    return MessageManager.createConversation(conversation);
  },
  createMessage: function (message) {
    return MessageManager.createMessage(message);
  },
  markConversationMessagesAsRead: function (conversationId) {
    MessageManager.markConversationMessagesAsRead(conversationId);
  },
  deleteConversation: function (conversationId) {
    MessageManager.deleteConversation(conversationId);
  }
});