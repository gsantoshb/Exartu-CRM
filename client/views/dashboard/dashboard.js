var ActivitiesHandler;
DashboardController = RouteController.extend({
  layoutTemplate: 'mainLayout',
    waitOn: function () {
      SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities');
      return [HierarchiesHandler, ActivitiesHandler];
    },
    action: function () {
      if (!this.ready()) {
        this.render('loadingContactable');
        return;
      }
      GAnalytics.pageview();
      this.render();
    },
    onAfterAction: function() {
      var title = 'Dashboard',
        description = 'Quickly check system status and activity';
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

var query ={
  options: {
    limit: 50,
    sort: {'data.dateCreated':-1}
  },
  filter: {
    searchString: ''
  }
};
var queryDep= new Deps.Dependency;


var listViewMode = new ReactiveVar(false);

Template.dashboard.created = function(){
  Meteor.autorun(function() {
    queryDep.depend();

    if (query.filter.searchString){
      Meteor.call('searchActivities', query.filter.searchString, function (err, result) {
        ActivitiesHandler.setFilter({entityId: { $in: result }});
      });
    } else {
      ActivitiesHandler.setFilter({});
    }
  });
};

Template.dashboard.helpers({
  activities: function(){
    queryDep.depend();
    var q={};
    if (query.filter.searchString) {
      var regexObject = {
        $regex: query.filter.searchString,
        $options: 'i'
      };
      q['data.displayName'] = regexObject;
    }
      return Activities.find(q, { sort: {'data.dateCreated': -1} });
  },
  listViewMode: function () {
    return listViewMode.get();
  }
});

Template.dashboard.events({
  'keyup #searchString': _.debounce(function(e){
      query.filter.searchString = e.target.value;
      queryDep.changed();
    },200),
  'click .addPlacement': function(){
    Session.set('addOptions', {job: this.entityId});
    Router.go('/placementAdd/placement');
  },
  'click #list-view': function () {
    listViewMode.set(true);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
  }
});

Template.activity.helpers({
  getTemplateForActivity: function(){
    switch (this.type){
      case Enums.activitiesType.contactableAdd:
        return 'newContactableActivity';
      case Enums.activitiesType.jobAdd:
        return 'newJobActivity';
      case Enums.activitiesType.taskAdd:
        return 'newTaskActivity';
    }
  }
});

Template.registerHelper('listViewMode', function () {
  return listViewMode.get();
});

Template.newContactableActivity.getActivityColor = function(){
  return helper.getActivityColor(this);
};
Template.newContactableActivity.getActivityIcon = function(){
  return helper.getActivityIcon(this);
};