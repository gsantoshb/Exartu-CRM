Messages = new Meteor.Collection("messages");

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

Meteor.methods({
	addMessage: function (message) {
		var user = Meteor.user();
		if (user == null)
			throw new Meteor.Error(401, "Please login");

		addSystemMetadata(message, user);

		return Messages.insert(message);
	}
});