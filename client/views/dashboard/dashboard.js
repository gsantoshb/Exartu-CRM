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
      SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', { filter: {type: {$in: activityTypes}}});
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
var listViewDefault=Session.get('dashboardListViewMode');
if (!listViewDefault)
{
  listViewDefault=true;
}
var listViewMode = new ReactiveVar(listViewDefault);

Template.dashboard.created = function(){
  Meteor.autorun(function() {
    queryDep.depend();

    if (query.filter.searchString){
      Meteor.call('searchActivities', query.filter.searchString, function (err, result) {
        ActivitiesHandler.setFilter({type: {$in: activityTypes}, entityId: { $in: result }});
      });
    } else {
      ActivitiesHandler.setFilter({type: {$in: activityTypes}});
    }
  });
};

Template.dashboard.helpers({
  activities: function(){
    return Activities.find({}, { sort: {'data.dateCreated': -1} });
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
    Session.set('dashboardListViewMode',false);
  },
  'click #detail-view': function () {
    listViewMode.set(false);
    Session.set('dashboardListViewMode',false);
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
      case Enums.activitiesType.placementAdd:
        return 'newPlacementActivity';
      case Enums.activitiesType.noteAdd:
        return 'newNoteActivity';
      case Enums.activitiesType.fileAdd:
        return 'newFileActivity';
    }
  }
});

Template.registerHelper('listViewMode', function () {
  return listViewMode.get();
});