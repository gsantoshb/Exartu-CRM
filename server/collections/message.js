Meteor.publish('messages', function () {
	var user = Meteor.users.findOne({
		_id: this.userId
	});

	if (!user)
		return false;

	return Messages.find({
		hierId: user.hierId
	});
})

/*
 * A way to comunicate with other system's users. It's private.
 *
 * Message:
 *  - to: [userId]
 *  - subject: string
 *  - content: string
 */

Meteor.startup(function () {
	Meteor.methods({
		createMessage: function (message, entityList) {
			var user = Meteor.user();
			if (user == null)
				throw new Meteor.Error(401, "Please login");

			message.entityIds = entityList;
			addSystemMetadata(message, user);
			var messageId = Messages.insert(message);

			// Create a reference of message to the entity
			var collections = [Contactables]; // Collections where to search entity
			_.forEach(entityList, function (entity) {
				_.forEach(collections, function (collection) {
					collection.update({
						_id: entity
					}, {
						$addToSet: {
							messages: messageId
						}
					});
				});
			});
		},
	});
});

Messages.before.insert(function (userId, doc) {
	doc.createdAt = Date.now();
});