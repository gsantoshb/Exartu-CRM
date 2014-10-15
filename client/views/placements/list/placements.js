PlacementsController = RouteController.extend({
  template: 'placements',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
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

  }
});
