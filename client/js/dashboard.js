DashboardController = RouteController.extend({
	template: 'dashboard',
	layoutTemplate: 'mainLayout',
});

Template.dashboard.rendered = function () {
	var vm = function () {
		var self = this;
		self.greeting = ko.observable("Welcome to Exartu");
		//self.activities = ko.meteor.find(Activities, {});

		return self;
	};

	helper.applyBindings(vm, 'dashboardVM');
};