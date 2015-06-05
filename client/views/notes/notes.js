var idNote;

NotesController = RouteController.extend({
  template: 'notes',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    if (!SubscriptionHandlers.NotesHandler) {
      SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe("notesView");
      return [SubscriptionHandlers.NotesHandler];
    }
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    if(this.params._id){
      //show the note
      idNote = this.params._id;
    }
    this.render();
    if(idNote) {
      Utils.showModal('addEditNote', idNote);
      idNote = null;
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