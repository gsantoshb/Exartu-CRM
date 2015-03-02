/**
 * Variables
 */
var JobHandler;

/**
 * Controller
 */
Session.set('entityId', undefined);
JobsController = RouteController.extend({
    template: 'jobs',
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        Session.set('entityId', undefined);
        console.log('job list waiton');
        if (!SubscriptionHandlers.JobHandler) {
            SubscriptionHandlers.JobHandler = SubscriptionHandlers.JobHandler || Meteor.paginatedSubscribe('jobs');
        }
        JobHandler = SubscriptionHandlers.JobHandler;
        return [ JobHandler ,LookUpsHandler];
        //return [ LookUpsHandler];
    },
    onAfterAction: function () {
        var title = 'Jobs',
            description = 'Manage your list here';
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
    },
    action: function () {
        if (this.ready())
            this.render();
        else
            this.render('loadingContactable');
        this.render();
    }
});

