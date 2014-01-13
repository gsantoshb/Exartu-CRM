Template.entityMessages.rendered = function () {
	var vm = function () {
		var self = this,
			entityId = Session.get('contactableId'),
			entityCollection = Session.get('entityCollection');

		self.messages = Messages.find({
			entityId: entityId
		});

		self.addMessage = function () {
			var messageId = Meteor.call('createMessage', {
				message: "msg test",
				entityId: entityId
			});
			window[entityCollection].update({
				_id: entityId
			}, {
				$addToSet: {
					messages: [messageId]
				}
			});
		};

		self.editMessage = function (data, index) {

		};

		return self;
	};

	ko.applyBindings(new vm(), document.getElementsByName('entityMessagesVM')[0]);
}

Meteor.methods({
	createMessage: function (newMessage) {
		Messages.insert(newMessage);
	}
});