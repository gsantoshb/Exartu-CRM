var HotListHandler;

HotListsController = RouteController.extend({
  template: 'hotLists',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    if (!SubscriptionHandlers.HotListHandler){
      SubscriptionHandlers.HotListHandler = SubscriptionHandlers.HotListHandler || Meteor.paginatedSubscribe('hotLists');
    }
    HotListHandler = SubscriptionHandlers.HotListHandler;
    return [HotListHandler, LookUpsHandler];
  },
  onAfterAction: function() {
    var title = 'HotLists',
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
  }
});
