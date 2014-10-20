var entityType=null;
TasksController = RouteController.extend({
    template: 'tasks',
    layoutTemplate: 'mainLayout',
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
  }
});