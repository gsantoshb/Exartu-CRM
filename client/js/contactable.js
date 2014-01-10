ContactableController = RouteController.extend({
	layoutTemplate: 'contactableLayout',
	action: function () {
		// define which template to render in function of the url's hash
		switch (this.params.hash) {
		case 'messages':
			this.render('test');
			break;
		case 'activities':
			this.render('activities');
			break;
		case undefined:
			this.render('activities');
			break;
		};
		// render contactableNavegation template on navegation regin defined on contactableLayout (client/layouts.html)
		this.render('contactableNavigation', {
			to: 'navegation'
		});
	},
	data: function () {
		Session.set('contactableId', this.params._id); // save current contactable to later use on templates
	},
});

Template.contactableNavigation.rendered = function () {
	// load contactable information
	var contactableVM = function () {
		var self = this;
		self.contactable = ko.meteor.findOne(Contactables, {
			_id: Session.get('contactableId')
		});
		self.contactable().displayName = ko.computed(
			function () {
				return self.contactable().firstName() + ', ' + self.contactable().lastName();
			}, self);

		return self;
	};

	ko.applyBindings(new contactableVM());
};