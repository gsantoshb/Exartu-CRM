Template.activities.rendered = function () {
	var vm = function () {
		var self = this,
			entityId = Session.get('entityId');

		self.activities = ko.meteor.find(Activities, {
			entityId: entityId
		});
		self.activityVM = function (activity) {
			switch (activity.type()) {
			case 0:
				return 'activityContactable';
			case 1:
				return 'activityMessage';
			}
		}

		// Quick add message
		self.newMessage = ko.observable();
		self.addMessage = function () {
			var messageId = Meteor.call('createMessage', {
				message: self.newMessage(),
			}, [entityId]);
			self.newMessage("");
		};

		return self;
	};

	ko.applyBindings(new vm(), document.getElementsByName('activitiesVM')[0]);
};


Meteor.methods({
	createMessage: function (message, entityList) {
		Messages.insert(message);
	}
});