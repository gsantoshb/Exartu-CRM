var registerPageView = function() {
//  GAnalytics.pageview(this.path);
}

Router.configure({
  disableProgressSpinner: true,
  notFoundTemplate: 'notFoundTemplate',
  waitOn: function() {
    return [HierarchiesHandler];
  },
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
    controller: 'DashboardController',
    waitOn: function() {
      return [HierarchiesHandler];
    },
    action: function() {
      if (!this.ready()) {
        this.render('loadingContactable');
        return;
      }
      GAnalytics.pageview();
      this.render();
    },
  });

  this.route('login', {
    path: '/login',
    template: 'login',
    onBeforeAction: function () {
      if (Meteor.user()) {
        this.redirect('dashboard');
      }
    },
    onAfterAction: function() {
      var title = 'Login',
        description = '';
      SEO.set({
        title: title,
        meta: {
          'description': description
        },
        og: {
          'title': title,
          'description': description
        }
      });
    }
  });

  this.route('contactables', {
    path: '/contactables/:type?',
    controller: 'ContactablesController',
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
    controller: 'JobsController',
    onRun: registerPageView
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
    controller: 'TasksController',
    plans: [SubscriptionPlan.plansEnum.enterprise]
  })

  this.route('lookupManagement', {
    path: '/management/lookups',
    controller: 'LookupsManagementController'
  })

  this.route('resumeParser', {
    path: '/resumeparser',
    controller: 'ResumeParserController',
    plans: [SubscriptionPlan.plansEnum.enterprise]
  })

  this.route('planLimitation', {
    path: '/planlimitation',
    template: 'planLimitation'
  })

  this.route('subscriptionPlan', {
    path: '/subscriptionplan',
    template: 'subscriptionPlanTemplate',
    action: function() {
      if (!this.ready()) {
        this.render('loadingContactable');
        return;
      }
      this.render('subscriptionPlanTemplate');
    },
    onAfterAction: function() {
      var title = 'Subscription',
        description = 'Subscription management';
      SEO.set({
        title: title,
        meta: {
          'description': description
        },
        og: {
          'title': title,
          'description': description
        }
      });
    }
  })

  this.route('emailVerification', {
    path: '/emailVerification/:token',
    action: function () {
      this.redirect('/user');
    }
  });
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