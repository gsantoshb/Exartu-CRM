var PlacementHandler;

PlacementsController = RouteController.extend({
  template: 'placements',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    if (!SubscriptionHandlers.PlacementHandler){
      SubscriptionHandlers.PlacementHandler = SubscriptionHandlers.PlacementHandler || Meteor.paginatedSubscribe('placements');
    }
    PlacementHandler = SubscriptionHandlers.PlacementHandler;
    return [PlacementHandler, LookUpsHandler];
  },
  onAfterAction: function() {
    var title = 'Placements',
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

Template.placements.helpers({
  placementCount: function(){
    return PlacementHandler.totalCount();
  }
});
