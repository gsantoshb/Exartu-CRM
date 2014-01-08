DashboardController = RouteController.extend({
	path: '/',
	template: 'dashboard',
	layoutTemplate: 'mainLayout',
	
	before: function() {

	}
});

Template.dashboard.greetings = "Welcome to Exartu!"