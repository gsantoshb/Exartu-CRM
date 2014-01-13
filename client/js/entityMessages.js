Template.entityMessages.rendered = function () {
	var vm = function () {
		var self = this,
			entityId = Session.get('entityId'),
			entityCollection = Session.get('entityCollection');

		self.messages = ko.meteor.find(Messages, {
			entityIds: entityId
		});

		self.addMessage = function () {
			var messageId = Meteor.call('createMessage', {
				message: "msg test2",
			}, [entityId]);
		};

		self.editMessage = function (data, index) {

		};

		return self;
	};

	ko.applyBindings(new vm(), document.getElementsByName('entityMessagesVM')[0]);
};

Meteor.methods({
	createMessage: function (message, entityList) {
		Messages.insert(message);
	}
});