
Router.configure({
  disableProgressSpinner: true,
  notFoundTemplate: 'notFoundTemplate',
  waitOn: function() {
    return HierarchiesHandler;
  },
  autoRender: true
});

var OnBeforeActions = {
  loginRequired: function() {
    if (!Meteor.userId()) {
      this.render('login');
    }else{
      userInfo = Utils.getUserInformation(Meteor.userId());
      TAPi18n.setLanguage(userInfo.language);

      $.cachedScript( "https://static.twilio.com/libs/twiliojs/1.2/twilio.js" ).done(function( script, textStatus ) {
        TwilioManager.startReceivingCalls();
      });



      this.next();
    }
  }
};

Router.onBeforeAction(OnBeforeActions.loginRequired, {
  except: ['login', 'register', 'addUser', 'notFound']
});


Router.map(function () {
  this.route('dashboard', {
    path: '/',
    controller: 'DashboardController'
  });
  this.route('calendar', {
        path: '/calendar',
        template: 'noteCalendar',
        controller: 'CalendarController'
  });


    this.route('login', {
    path: '/login',
    controller: 'LoginController'
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
    path: '/contactable/:_id/:tab?',
    controller: 'ContactableController'
  });

  this.route('addContactablePage', {
    path: '/contactableAdd/:objType',
    controller: 'ContactableAddController'
  });

  this.route('addJobPage', {
    path: '/jobAdd/:objType',
    controller: 'JobAddController'
  });

  this.route('jobs', {
    path: '/jobs/:type?',
    controller: 'JobsController'
  });

  this.route('job', {
    path: '/job/:_id/:tab?',
    controller: 'JobController'
  });


    this.route('deals', {
        path: '/deals',
        controller: 'DealsController'
    });

    this.route('addDealPage', {
        path: '/dealAdd/:objType',
        controller: 'DealAddController'
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
    path: '/userProfile/:userId?',
    controller: 'UserProfileController'
  });

  this.route('tenants', {
    path: '/tenants',
    controller: 'TenantsController'
  });

  this.route('tenant', {
    path: '/tenant/:_id?',
    controller: 'TenantController'
  });

  this.route('tenantUsers', {
    path: '/tenantUsers',
    controller: 'TenantUsersController'
  });

  this.route('tenantUser', {
    path: '/tenantUser/:_id',
    controller: 'TenantUserController'
  });

  this.route('inbox', {
    path: '/inbox',
    controller: 'ConversationsController'
  });

  this.route('conversation', {
    path: '/inbox/:_id',
    controller: 'ConversationController'
  });
  this.route('notes', {
    path: '/notes/:_id?',
    controller: 'NotesController'
  });

  this.route('placements', {
    path: '/placements',
    controller: 'PlacementsController'
  });

  this.route('addPlacementPage', {
      path: '/placementAdd/:objType',
      controller: 'PlacementAddController'
  });

  this.route('placement', {
    path: '/placement/:_id/:tab?',
    controller: 'PlacementController'
  });
  this.route('hotLists', {
    path: '/hotLists',
    controller: 'HotListsController'
  });

  this.route('addHotListPage', {
    path: '/hotListAdd',
    controller: 'HotListAddController'
  });

  this.route('hotList', {
    path: '/hotList/:_id/:tab?',
    controller: 'HotListController'
  });
    this.route('leaderBoards', {
        path: '/leaderBoards',
        controller: 'LeaderBoardsController'
    });

    this.route('addLeaderBoardPage', {
        path: '/leaderBoardAdd/:objType',
        controller: 'LeaderBoardAddController'
    });

    this.route('leaderBoard', {
        path: '/leaderBoard/:_id/:tab?',
        controller: 'LeaderBoardController'
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
  });

  //this.route('docourseManagement', {
  //  path: '/management/hrconcourse',
  //  controller: 'hrConcourseManagementController'
  //});
  this.route('hierarchyMail', {
    path: '/management/hierarchyMail',
    controller: 'HierarchyMailController'
  });
  this.route('clickFunnel', {
    path: '/management/clickFunnel',
    controller: 'clickFunnelController'
  });
  this.route('twilioManagement', {
    path: '/management/twilioManagement',
    controller: 'TwilioManagementController'
  });

  this.route('resumeParser', {
    path: '/resumeparser',
    controller: 'ResumeParserController'
  });

  this.route('planLimitation', {
    path: '/planlimitation',
    template: 'planLimitation'
  });


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
  });

  this.route('emailVerification', {
    path: '/emailVerification/:token',
    action: function () {
      this.redirect('/user');
    }
  });

  this.route('addUser', {
    path: '/users/add',
    controller: 'AddUserController'
  });

  this.route('notFound', {
    path: '/notfound',
    template: 'notFoundTemplate'
  });

  this.route('hierarchyManagement', {
    path: '/hierarchyManagement',
    controller: 'HierarchiesManagementController'
  });
  this.route('testData', {
    path: '/management/testData',
    controller: 'TestDataController'
  });

  this.route('invitationVerification', {
    path: '/invitationVerification/:token',
    controller: 'InvitationController'
  });

  this.route('emailTemplate', {
    path: '/emailTemplate/:_id',
    controller: 'EmailTemplateController'
  });
  this.route('addEmailTemplate', {
    path: '/addEmailTemplate/:category',
    controller: 'EmailTemplateController'
  });
  this.route('emailTemplates', {
    path: '/emailTemplates',
    controller: 'EmailTemplateListController'
  });

  this.route('docCenterManagement', {
    path: '/management/hrConcourse',
    controller: 'DocCenterManagementController'
  });

  this.route('twEnterpriseManagement', {
    path: '/management/enterprise',
    controller: TwEnterprisetController
  });

  this.route('documentInstance', {
    path: '/documentInstance/:id',
    controller: 'InstanceController'
  });

  this.route('cardReader', {
    path: '/management/cardReader',
    controller: 'CardReaderController'
  });

  this.route('mailchimpManagement', {
    path: '/management/mailchimp',
    controller: 'MailChimpManagementController'
  });

  this.route('getContactCSV', {
    path: '/getContactCSV',
    controller: 'GetContactCSVController'
  });

  this.route('scanEmployeeCard', {
    path: '/scanEmployeeCard',
    controller: 'ScanEmployeeCardController'
  });

  this.route('helpManagement', {
    path: '/management/help',
    controller: 'HelpManagementController'
  });
  this.route('helpVideos', {
    path: '/help',
    controller: 'HelpVideosController'
  });

  this.route('settings', {
    path: 'settings',
    controller: SettingsController
  });

  this.route('timeEntry', {
    path: 'timeEntry',
    controller: TimeEntryController
  });
  this.route('extras', {
    path: 'extras',
    controller: ExtrasController
  });
  this.route('pastJobLeads', {
    path: 'pastJobLeads',
    controller: PastJobLeadsController
  });
  this.route('timecard', {
    path: 'timeEntry/timecard/:id',
    controller: TimeCardController
  });
  this.route('addWorkFlow',{
    path: 'workFlow/addWorkFlow',
    controller: AddWorkFlowController
  })
});


/* hack to scroll up on navigation */
var lastRoute=null;
var lastParam=null;
Deps.autorun(function () {
  var current = Router.current();
  if (current){
    // prevent scroll up when navigating with tabs
    if(lastRoute == current.route.getName() && lastParam == current.params._id){
      return
    }
    lastRoute = current.route.getName();
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