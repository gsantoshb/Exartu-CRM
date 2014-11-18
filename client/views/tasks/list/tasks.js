var TasksHandler, query, statusName;

TasksController = RouteController.extend({
  template: 'tasks',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return SubscriptionHandlers.TasksHandler = TasksHandler = Meteor.paginatedSubscribe("tasks");
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }

    // Search string
    var searchStringQuery = {};
    if (this.params.search) {
      searchStringQuery.default = this.params.search;
    }

    // Status
    if (this.params.status) {
      statusName = this.params.status;
    }

    // Owned by me
    var ownedByMeQuery = {};
    if (this.params.owned) {
      ownedByMeQuery.default = this.params.owned ? Meteor.userId() : undefined;
    }

    // Inactive
    var inactiveQuery = { type: Utils.ReactivePropertyTypes.boolean };
    if (this.params.inactives) {
      inactiveQuery.default = !! this.params.inactives;
    }

    // Assigned to
    var assignedToQuery = {};
    if (this.params.assignedTo) {
      assignedToQuery.default = this.params.assignedTo;
    }

    query = new Utils.ObjectDefinition({
      reactiveProps: {
        searchString: searchStringQuery,
        ownedByMe: ownedByMeQuery,
        inactives: inactiveQuery,
        assignedTo: assignedToQuery
      }
    });

    this.render('tasks');
  },
  onAfterAction: function() {
    var title = 'Tasks',
      description = 'Manage your tasks here';
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

Template.tasks.helpers({
  taskCount: function(){
    return TasksHandler.totalCount();
  },
  query: function () {
    return query;
  },
  statusName: function () {
    return statusName;
  }
});