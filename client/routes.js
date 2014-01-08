Router.map(function () {
	this.route('dashboard', {
		controller: 'DashboardController'
	});
	
	this.route('contactables', {
		controller: 'ContactablesController'
	});
});