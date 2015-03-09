var TaskHandler, query, statusName;
var idTask, singleTaskHandler;
TasksController = RouteController.extend({
    template: 'Tasks',
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        Session.set('entityId', undefined);
        if (!SubscriptionHandlers.TaskHandler) {
            SubscriptionHandlers.TaskHandler = TaskHandler = Meteor.paginatedSubscribe("tasks");

            return [SubscriptionHandlers.TaskHandler, LookUpsHandler];
        }
    },
    action: function () {
        if (this.ready())
            this.render();
        else
            this.render('loadingContactable');

        if(this.params._id){
          //show the task
          idTask = this.params._id;

        };
        this.render();
      if(idTask) {
        Utils.showModal('addEditTask', idTask);

      }

    },
    onAfterAction: function () {

        var title = 'Task',
            description = 'Manage your Task here';
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
//Template.tasks.destroyed = function(){
//
//}
Template.tasks.rendered = function(){



};
