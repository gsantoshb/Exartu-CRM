/*
 * A way to comunicate with other system's users. It's private.
 *
 * Message:
 *  - from: current user id
 *  - destination: [userId]
 *  - subject: string
 *  - content: string
 */

Meteor.publish('messages', function () {
	return Messages.find({
		$or: [
			{
				destination: this.userId,
			},
			{
				from: this.userId
			}
		]
	});
})


/*
 * Set of messages between two users.
 *
 * Message:
 *  - user1:
 *  - user2:
 *  - createdAt: string
 */

Meteor.publish('conversations', function() {
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
})

Meteor.startup(function () {
	Meteor.methods({
        createConversation: function(user1, user2) {
            if (Conversations.findOne({user1: user1, user2: user2}) != null)
                throw new Meteor.Error(400, "Conversations between users already started");
                
            return Conversations.insert({user1: user1, user2: user2});
        },
        createMessage: function (message) {
			// validations
			var user = Meteor.user();
			if (user == null)
				throw new Meteor.Error(401, "Please login");

			if (typeof message.content != typeof '' || message.content == '')
				throw new Meteor.Error(400, "Invalid message content");

			message.from = user._id;
			message.readed = false;

			Messages.insert(message);
		},
	});
});

Messages.before.insert(function (userId, doc) {
	doc.createdAt = Date.now();
});

Conversations.before.insert(function (userId, doc) {
	doc.createdAt = Date.now();
});