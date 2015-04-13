var activityTypes = {
  val: [
    Enums.activitiesType.contactableAdd,
    Enums.activitiesType.taskAdd,
    Enums.activitiesType.placementAdd,
    Enums.activitiesType.jobAdd,
    Enums.activitiesType.noteAdd,
    Enums.activitiesType.fileAdd
  ],
  dep: new Tracker.Dependency,
  get: function() {
    this.dep.depend();
    return this.val;
  },
  set: function(newVal) {
    this.val = newVal;
    this.dep.changed();
  }
};
var listViewMode = new ReactiveVar(true);
var searchString = new ReactiveVar('');

var getSelectedActivityFilters = function(){
  var filters = [];
  $('.activityFilter-option').each(function() {
    if($(this).prop('checked') && $(this).val() != 'all') {
      filters.push($(this).val());
    }
  });
  return filters;
};

var subscribe = function(){
  if (ActivitiesHandler) {
    ActivitiesHandler.setFilter({type: {$in: activityTypes.get()}}, {searchString: searchString.get()});
  } else {
    SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes.get()}}});
  }
}

DashboardController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    if (!SubscriptionHandlers.ActivitiesHandler) {
      SubscriptionHandlers.ActivitiesHandler = ActivitiesHandler = Meteor.paginatedSubscribe('activities', {filter: {type: {$in: activityTypes.get()}}});
      return [HierarchiesHandler, SubscriptionHandlers.ActivitiesHandler];
    }
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

Template.dashboard.created = function () {
  this.autorun(function () {
    subscribe();
  });
};

Template.dashboard.helpers({
  activities: function () {
    if(!ActivitiesHandler.isLoading()){
      var intActivityTypes = [];
      _.each(activityTypes.get(), function(activityType) {
        intActivityTypes.push(parseInt(activityType));
      });
      var activ = Activities.find({
        type: {
          $in: intActivityTypes
        }
      }, {sort: {'data.dateCreated': -1}});
      return activ;
    }
    else{
      return;
    }

  },
  listViewMode: function () {
    return listViewMode.get();
  },
  getCtx: function () {
    this.listViewMode = listViewMode.get();
    return this;
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
  getUserDisplayName: function() {
    var user = Meteor.user() != null ? Meteor.user() : {};
    var hier = Meteor.user() != null ? Hierarchies.findOne(Meteor.user().currentHierId) : undefined;

    if(user.firstName && user.lastName){
      return user.firstName+' '+user.lastName;
    }
    else{
      if(user.username)
        return user.username;
      else if(hier)
        return hier.name;
      else if(user.emails)
        return user.emails[0].address;
      else
        return '-';
    }
  },
  getTypeContactable: function(){
    return Enums.activitiesType.contactableAdd;
  },
  getTypeTasks: function(){
    return Enums.activitiesType.taskAdd;
  },
  getTypePlacements: function(){
    return Enums.activitiesType.placementAdd;
  },
  getTypeJobs: function(){
    return Enums.activitiesType.jobAdd;
  },
  getTypeNotes: function(){
    return Enums.activitiesType.noteAdd;
  },
  getTypeFiles: function(){
    return Enums.activitiesType.fileAdd;
  }

});

Template.dashboard.events({
  'keyup #searchString': _.debounce(function (e) {
    searchString.set(e.target.value);
  }, 200),
  'click #activityFilter input': function(e, ctx) {
    if( $(e.currentTarget).val() == 'all' ){
      if( $(e.currentTarget).prop('checked') ){
        _.each($('#activityFilter input'), function(element){
          $(element).prop('checked', true);
        });
      }
      else{
        _.each($('#activityFilter input'), function(element){
          $(element).prop('checked', false);
        });
      }
    }
    else {
      if (!$(e.currentTarget).prop('checked'))
        $('#activityFilter input#feed-all').prop('checked', false);
    }

    activityTypes.set(getSelectedActivityFilters());
    subscribe();
  },
  'click .addDashboardNote': function(e) {
    e.preventDefault();

    Utils.showModal('dashboardAddNote');

    return false;
  },
  'click .addTaskDashboard': function(e) {
    e.preventDefault();

    Utils.showModal('addEditTask', null);

    return false;
  }
});
