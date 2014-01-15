Template.tags.rendered = function () {
	var vm = function () {
		var self = this,
			entityID = Session.get('entityId');

		self.contactable = ko.meteor.findOne(Contactables, {
			_id: entityID
		});

		self.addStep = ko.observable(0);
		self.nextStep = function () {
			self.addStep(self.addStep() + 1);
		}

		if (!self.contactable())
			console.log('contactable is undefined');
		if (!self.contactable().tags)
			self.contactable().tags = ko.observableArray([]);
		self.newTag = ko.observable('');
		self.isAdding = ko.observable(false);
		self.addTag = function () {
			Contactables.update({
				_id: entityID
			}, {
				$addToSet: {
					tags: self.newTag()
				}
			})
			self.newTag('');
			self.addStep(0);
		}
		return self;
	};
    helper.applyBindings(vm, 'tagsVM', ContactableHandler);
}