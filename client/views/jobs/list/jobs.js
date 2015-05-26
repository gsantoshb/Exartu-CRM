
JobsController = RouteController.extend({
  template: 'jobs',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    Session.set('entityId', undefined);
    return [LookUpsHandler];
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
  }
});

