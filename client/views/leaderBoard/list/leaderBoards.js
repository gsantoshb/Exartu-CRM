var LeaderBoardHandler;

LeaderBoardsController = RouteController.extend({
  template: 'leaderBoards',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    if (!SubscriptionHandlers.LeaderBoardHandler){
      SubscriptionHandlers.LeaderBoardHandler = SubscriptionHandlers.LeaderBoardHandler || Meteor.paginatedSubscribe('leaderBoards');
    }
    LeaderBoardHandler = SubscriptionHandlers.LeaderBoardHandler;
    return [LeaderBoardHandler, LookUpsHandler];
  },
  onAfterAction: function() {
    var title = 'LeaderBoards',
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

Template.leaderBoards.helpers({
  leaderBoardCount: function(){
    return LeaderBoardHandler.totalCount();
  }
});
