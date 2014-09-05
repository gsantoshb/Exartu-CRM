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
    if (!Meteor.userId() && Router.current().route.name != 'login' && Router.current().route.name != 'register' && Router.current().route.name != 'notFound') {
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
    }
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

  this.route('register', {
    path: '/register',
    controller: 'RegisterController'
  });

  this.route('contactables', {
    path: '/contactables/:type?',
    controller: 'ContactablesController'
  });

  this.route('contactable', {
    path: '/contactable/:_id',
    controller: 'ContactableController'
  });

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


    this.route('deals', {
        path: '/deals',
        controller: 'DealsController',
        onRun: registerPageView
    });

    this.route('addDealPage', {
        path: '/dealAdd/:objType',
        controller: 'DealAddController',
        waitOn: [dType.ObjTypesHandler]
    });

    this.route('deal', {
        path: '/deal/:_id',
        controller: 'DealController'
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
  });

  this.route('notes', {
    path: '/notes',
    controller: 'NotesController'
  });

  this.route('placements', {
    path: '/placements',
    controller: 'PlacementsController'
  });
  this.route('placement', {
    path: '/placement/:_id',
    controller: 'PlacementController'
  });
    this.route('addPlacementPage', {
        path: '/placementAdd/:objType',
        controller: 'PlacementAddController',
        waitOn: [dType.ObjTypesHandler]
    });

   this.route('candidates', {
    path: '/candidates',
    controller: 'CandidatesController'
  });
  this.route('candidate', {
    path: '/candidate/:_id',
    controller: 'CandidatesController'
  });

  this.route('lookupManagement', {
    path: '/management/lookups',
    controller: 'LookupsManagementController'
  })

  this.route('hrConcourseManagement', {
    path: '/management/hrconcourse',
    controller: 'hrConcourseManagementController'
  })

  this.route('resumeParser', {
    path: '/resumeparser',
    controller: 'ResumeParserController'
//    plans: [SubscriptionPlan.plansEnum.enterprise]
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
    },
    waitOn: function () {
      return SystemConfigsHandler;
    }
  })

  this.route('emailVerification', {
    path: '/emailVerification/:token',
    action: function () {
      this.redirect('/user');
    }
  });
  
  this.route('notFound', {
    path: '/notfound',
    template: 'notFoundTemplate'
  })

});


/* hack to scroll up on navigation */
var lastRoute=null;
var lastParam=null;
Deps.autorun(function () {
  var current = Router.current();
  if (current){
    // prevent scroll up when navigating with tabs
    if(lastRoute == current.route.name && lastParam == current.params._id){
      return
    }
    lastRoute = current.route.name;
    lastParam = current.params._id;
  }
  Deps.afterFlush(function () {
    $('.content-inner').scrollTop(0);
    $(window).scrollTop(0);
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