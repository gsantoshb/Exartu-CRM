Router.configure({
    disableProgressSpinner: true,
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
        controller: 'ContactableController'
    });
//    debugger;
  this.route('addContactablePage', {
    path: '/contactableAdd/:objType',
    controller: 'ContactableAddController',
    waitOn: [dType.ObjTypesHandler]
  });
  this.route('addJobPage', {
    path: '/jobAdd/:objType',
    controller: 'JobAddController',
    waitOn: [dType.ObjTypesHandler]
  });

    this.route('jobs', {
        path: '/jobs/:type?',
        controller: 'JobsController'
    });

    this.route('job', {
        path: '/job/:_id',
        controller: 'JobController'
    });

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

// handler for testing loading pages
//foreverHandler={
//    wait: true,
//    dep: new Deps.Dependency,
//    ready: function(){
//        this.dep.depend()
//        return ! this.wait
//    },
//    stopWaiting:function(){
//        this.wait=false;
//        this.dep.changed();
//    }
//}