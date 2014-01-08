DashboardController = RouteController.extend({
	path: '/',
	template: 'dashboard',
	layoutTemplate: 'mainLayout',
	
	before: function() {
		alert("Dashboard view");
	}
});

Template.dashboard.greetings = "Welcome to Exartu!"