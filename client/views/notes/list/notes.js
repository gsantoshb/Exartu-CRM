var NotesHandler, query, statusName;

NotesController = RouteController.extend({
  template: 'notes',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    if (!SubscriptionHandlers.NotesHandler){
      SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe("notes");
    }
    NotesHandler = SubscriptionHandlers.NotesHandler;
    return [NotesHandler];
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }

    this.render('notes');
  },
  onAfterAction: function () {
    var title = 'Notes',
      description = 'Manage your notes here';
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

Template.notes.helpers({
  noteCount: function () {
    return NotesHandler.totalCount();
  }
});