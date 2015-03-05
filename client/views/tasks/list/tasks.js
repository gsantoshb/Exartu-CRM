var TaskHandler, query, statusName;

TasksController = RouteController.extend({
    template: 'Tasks',
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        Session.set('entityId', undefined);
        if (!SubscriptionHandlers.TaskHandler) {
            SubscriptionHandlers.TaskHandler = TaskHandler = Meteor.paginatedSubscribe("tasks");
        }
        return [SubscriptionHandlers.TaskHandler,LookUpsHandler];
    },
    action: function () {
        if (this.ready())
            this.render();
        else
            this.render('loadingContactable');
        this.render();

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
