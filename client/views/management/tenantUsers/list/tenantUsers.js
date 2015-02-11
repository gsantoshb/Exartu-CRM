var TenantUserHandler;

TenantUsersController = RouteController.extend({
  template: 'tenantUsers',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    SubscriptionHandlers.TenantUserHandler = TenantUserHandler = SubscriptionHandlers.TenantUserHandler
    || Meteor.paginatedSubscribe('tenantUsers');
    return [TenantUserHandler, LookUpsHandler];
  },
  onAfterAction: function() {
    var title = 'TenantUsers',
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
  action: function(){
    if (this.ready())
      this.render();
    else
      this.render('loadingContactable');

    this.render();
  }
});

Template.tenantUsers.helpers({
  tenantUserCount: function(){
    return TenantUserHandler.totalCount();
  }
});
