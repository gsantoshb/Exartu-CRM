var NotesHandler, query, statusName;

NotesController = RouteController.extend({
  template: 'notes',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return SubscriptionHandlers.NotesHandler = NotesHandler = Meteor.paginatedSubscribe("notes");
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