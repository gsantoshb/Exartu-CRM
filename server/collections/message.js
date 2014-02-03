Meteor.publish('messages', function () {
	return Messages.find({
		destination: this.userId
	});
})

/*
 * A way to comunicate with other system's users. It's private.
 *
 * Message:
 *  - from: current user id
 *  - destination: [userId]
 *  - subject: string
 *  - content: string
 */

Meteor.startup(function () {
	Meteor.methods({
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