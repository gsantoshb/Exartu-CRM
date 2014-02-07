Router.configure({
	before: function () {
		if (!Meteor.userId() && Router.current().route.name != 'login') {
			this.redirect('login');
		}
	},
	waitOn: function () {
		return [Meteor.subscribe('messages'), Meteor.subscribe('objTypes')];
	}
});
Router.map(function () {
	this.route('dashboard', {
		path: '/',
		controller: 'DashboardController'
	});

	this.route('login', {
		path: '/login',
		template: 'login',
		before: function () {
			if (Meteor.user()) {
				this.redirect('dashboard');
			}
		}
	});

	this.route('contactables', {
		path: '/contactables',
		controller: 'ContactablesController'
	});

	this.route('contactable', {
		path: '/contactable/:_id',
		controller: 'ContactableController'
	});

	this.route('jobs', {
		path: '/jobs',
		controller: 'JobsController'
	});

    this.route('deals', {
        path: '/deals',
        controller: 'DealsController',
        templateLayout: 'mainDealLayout'
    });

    this.route('deal', {
        path: '/deal/:_id',
        controller: 'DealController'
    });

	this.route('userManagement', {
		path: '/users',
		controller: 'UserManagementController'
	});

	this.route('messages', {
		path: '/messages',
		controller: 'MessagesController'
	})
});