
var ActivitiesHandler;
var activityTypes = [
  Enums.activitiesType.contactableAdd,
  Enums.activitiesType.taskAdd,
  Enums.activitiesType.placementAdd,
  Enums.activitiesType.jobAdd,
  Enums.activitiesType.noteAdd,
  Enums.activitiesType.fileAdd
];

DashboardController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    //if (!SubscriptionHandlers.ActivitiesHandler) {
    //  SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes}}});
    //  return [HierarchiesHandler, SubscriptionHandlers.ActivitiesHandler];
    //}
  },
  onAfterAction: function () {
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


var query = {
  options: {
    limit: 50,
    sort: {'data.dateCreated': -1}
  },
  filter: {
    searchString: ''
  }
};
var queryDep = new Deps.Dependency;
var searchString = new ReactiveVar('');
var listViewMode = new ReactiveVar(true);

// Main template
Template.dashboard.created = function () {
  Meteor.autorun(function () {

      queryDep.depend();
      if (ActivitiesHandler) {
        ActivitiesHandler.setFilter({type: {$in: activityTypes}}, {searchString: query.filter.searchString});
      }
      else{
        SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes}}});
      }

  });
};

Template.dashboard.helpers({
  activities: function () {
    return Activities.find({}, {sort: {'data.dateCreated': -1}});
  },
  listViewMode: function () {
    return listViewMode.get();
  },
  getTemplateForActivity: function () {
    switch (this.type) {
      case Enums.activitiesType.contactableAdd:
        return 'contactableAddActivity';
      case Enums.activitiesType.jobAdd:
        return 'jobAddActivity';
      case Enums.activitiesType.taskAdd:
        return 'taskAddActivity';
      case Enums.activitiesType.placementAdd:
        return 'placementAddActivity';
      case Enums.activitiesType.noteAdd:
        return 'noteAddActivity';
      case Enums.activitiesType.fileAdd:
        return 'fileAddActivity';
    }
  },
  getCtx: function () {
    this.listViewMode = listViewMode.get();
    return this;
  },
  isReady: function(){

      return ActivitiesHandler.ready();

  }
});

Template.dashboard.events({
  'keyup #searchString': _.debounce(function (e) {
    query.filter.searchString = e.target.value;
    queryDep.changed();
  }, 200),
  'click #list-view': function () {
    listViewMode.set(true);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
  }
});
