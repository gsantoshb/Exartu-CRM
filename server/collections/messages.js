/*
 * A way to comunicate with other system's users. It's private.
 *
 * Message:
 *  - conversationId
 *  - from: current user id
 *  - subject: string
 *  - content: string
 *  - read: boolean
 */

Meteor.publish('messages', function () {
    // TODO: only publish message where current user is involved
    return Messages.find();
})

Messages.allow({
    update: function (userId, doc) {
        return doc.from == Meteor.userId() || doc.destination == Meteor.userId();
    }
});

/*
 * Set of messages between two users.
 *
 * Message:
 *  - user1:
 *  - user2:
 *  - subject
 *  - dateCreated: string
 */

Meteor.publish('conversations', function () {
    return Conversations.find({
        $or: [
            {
                user1: this.userId
            },
            {
                user2: this.userId
            }
        ]
    })
});

Conversations.allow({
    update: function (userId, doc) {
        return doc.user1 == userId || doc.user2 == userId;
    }
})

Meteor.startup(function () {
    Meteor.methods({
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
    });
});

Messages.before.insert(function (userId, doc) {
    doc.dateCreated = Date.now();
});

Conversations.before.insert(function (userId, doc) {
    doc.dateCreated = Date.now();
});
// indexes
Messages._ensureIndex({conversationId: 1});
