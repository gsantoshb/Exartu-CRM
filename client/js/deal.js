DealController = RouteController.extend({
	layoutTemplate: 'dealLayout',
	action: function () {
		// define which template to render in function of the url's hash
		switch (this.params.hash) {
		case 'messages':
			this.render('entityMessages');
			break;
		case 'activities':
			this.render('activities');
			break;
		case 'asendEmail':
			this.render('sendEmail');
			break;
		case undefined:
			this.render('activities');
			break;
		};
		// render dealNavigation template on navigation region defined on dealLayout (client/layouts.html)
		this.render('dealNavigation', {
			to: 'navigation'
		});
	},
	data: function () {
		Session.set('entityId', this.params._id); // save current deal to later use on templates
		Session.set('entityCollection', 'Deals');
	}
});

Template.dealNavigation.rendered = function () {
	// load deal information
	var vm = function () {
		var self = this;
		self.deal = ko.meteor.findOne(Deals, {
			_id: Session.get('entityId')
		});
		Session.set('entityDisplayName', self.deal().displayName());

		//		self.deal().displayName = ko.computed(
		//			function () {
		//				var c = self.deal();
		//				return c.isCustomer != undefined && c.isCustomer() ? c.organizationName() : c.person.firstName() + ', ' + c.person.lastName();
		//			}, self);
		return self;
	};
	helper.applyBindings(vm, 'dealNavigationVM', DealHandler);
};

Template.dealsLayout.displayName = function () {
	return Session.get('entityDisplayName');
};