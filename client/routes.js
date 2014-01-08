Router.map(function () {
	this.route('dashboard', {
		controller: 'DashboardController'
//		path: '/',
//		template: 'dashboard',
//		layoutTemplate: 'mainLayout',
	});
	
	this.route('contactables', {
		path: '/contactables',
		template: 'contactables',
		layoutTemplate: 'mainLayout',
	});
});