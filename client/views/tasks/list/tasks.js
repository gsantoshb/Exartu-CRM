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