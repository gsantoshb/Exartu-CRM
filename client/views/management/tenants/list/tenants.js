var TenantHandler;

TenantsController = RouteController.extend({
  template: 'tenants',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    SubscriptionHandlers.TenantHandler = TenantHandler = SubscriptionHandlers.TenantHandler || Meteor.paginatedSubscribe('tenants');
    Meteor.paginatedSubscribe('tenantUsers')
    return [TenantHandler, LookUpsHandler];
  },
  onAfterAction: function() {
    var title = 'Tenants',
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

Template.tenants.helpers({
  tenantCount: function(){
    return TenantHandler.totalCount();
  }
});
