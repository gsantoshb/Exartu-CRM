getEntityMessageVM = function (entityId, collection) {
	var vm = function () {
		var self = this;

		var newMessage = {
			text: "message test"
		};

		self.messages = ko.observableArray(Meteor.call('getEntityMessages', entityId));
		self.addMessage = function () {
			var messageId = Meteor.call('createMessage', newMessage);
			windows[collection].update({
				_id: entityId
			}, {
				$addToSet: {
					messages: [messageId]
				}
			});
		}
	};
	return new vm();
}

Meteor.methods({
	createMessage: function (newMessage) {
		Messages.insert(newMessage);
	}
});