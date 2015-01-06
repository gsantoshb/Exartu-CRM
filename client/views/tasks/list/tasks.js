var TasksHandler, query, statusName;

TasksController = RouteController.extend({
  template: 'tasks',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    if (!SubscriptionHandlers.TasksHandler){
      SubscriptionHandlers.TasksHandler = TasksHandler = Meteor.paginatedSubscribe("tasks");
    }
    return SubscriptionHandlers.TasksHandler;
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }

    this.render('tasks');
  },
  onAfterAction: function () {
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
  taskCount: function () {
    return TasksHandler.totalCount();
  }
});