Template.tags.rendered = function () {
	var vm = function () {
		var self = this;
		self.contactable = ko.meteor.findOne(Contactables, {
			_id: Session.get('contactableId')
		});
		self.tags = self.contactable().tags;
		self.newTag = ko.observable('');
		self.isAdding = ko.observable(false);
		self.addTag = function () {
			Contactables.update({
				_id: Session.get('contactableId')
			}, {
				$addToSet: {
					tags: self.newTag()
				}
			})
		}
		return self;
	};

	ko.applyBindings(new vm(), document.getElementsByName('tagsVM')[0]);
}