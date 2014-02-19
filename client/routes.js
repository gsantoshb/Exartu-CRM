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
        path: '/contactables/:type?',
        controller: 'ContactablesController'
    });

    this.route('contactable', {
        path: '/contactable/:_id',
        controller: 'ContactableController'
    });

    this.route('jobs', {
        path: '/jobs/:type?',
        controller: 'JobsController'
    });

    this.route('job', {
        path: '/job/:_id',
        controller: 'JobController'
    });
    if (Meteor.user() && Meteor.user().permissions && Meteor.user().permissions.indexOf(Enums.permissionFunction.Sales) > 0) {
        this.route('deals', {
            path: '/deals',
            controller: 'DealsController'
        });

        this.route('deal', {
            path: '/deal/:_id',
            controller: 'DealController'
        });
    }

    this.route('users', {
        path: '/users',
        controller: 'UsersController'
    });

    this.route('messages', {
        path: '/messages',
        controller: 'ConversationsController'
    });

    this.route('tasks', {
        path: '/tasks',
        controller: 'TasksController'
    });
});