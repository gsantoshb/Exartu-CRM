MatchupsController = RouteController.extend({
  template: 'matchups',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    return [MatchupHandler, Meteor.subscribe('jobs'), Meteor.subscribe('contactables')];
  },
  onAfterAction: function() {
    var title = 'Matchups',
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
