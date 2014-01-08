Router.map(function () {
	this.route('dashboard', {
		path: '/',
		controller: 'DashboardController'
	});
	
	this.route('contactables', {
		path: '/contactables',
		controller: 'ContactablesController'
	});
});