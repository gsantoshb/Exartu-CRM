Router.configure({
    disableProgressSpinner: true,
    loadingTemplate: 'loading',
  onBeforeAction: function () {
        if (!Meteor.userId() && Router.current().route.name != 'login') {
            this.redirect('login');
        }
    },
  autoRender: true
});

Router.map(function () {
    this.route('dashboard', {
        path: '/',
        controller: 'DashboardController'
    });

    this.route('login', {
        path: '/login',
        template: 'login',
    onBeforeAction: function () {
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
        controller: 'ContactableController',
        waitOn: [ObjTypesHandler, ContactableHandler, ContactMethodsHandler]//GoogleMaps
    });

    this.route('jobs', {
        path: '/jobs/:type?',
        controller: 'JobsController'
    });

    this.route('job', {
        path: '/job/:_id',
        controller: 'JobController'
    });
    //    if (Meteor.user() && Meteor.user().permissions && Meteor.user().permissions.indexOf(Enums.permissionFunction.Sales) > 0) {
    //    this.route('deals', {
    //        path: '/deals',
    //        controller: 'DealsController'
    //    });
    //
    //    this.route('deal', {
    //        path: '/deal/:_id',
    //        controller: 'DealController'
    //    });
    //    }

    this.route('users', {
        path: '/users',
        controller: 'UsersController'
    });
    this.route('userProfile', {
        path: '/user/:_id?',
        controller: 'UserProfileController'
    });

    this.route('inbox', {
        path: '/inbox',
        controller: 'ConversationsController'
    });

    this.route('conversation', {
        path: '/inbox/:_id',
        controller: 'ConversationController'
    });

    this.route('tasks', {
        path: '/tasks',
        controller: 'TasksController'
    })

    this.route('lookupManagement', {
        path: '/management/lookups',
        controller: 'LookupsManagementController'
    })
});