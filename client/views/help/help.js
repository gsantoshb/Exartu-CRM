HelpVideosController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return Meteor.subscribe('helpVideos');
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('helpVideos')
  }
});

Template.helpVideos.helpers({
  helpVideos: function () {
    return HelpVideos.find({},{ sort:{ order: 1 } });
  }
});
