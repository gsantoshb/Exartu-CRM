AssignmentsController = RouteController.extend({
  template: 'assignments',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    return [AssignmentHandler, Meteor.subscribe('jobs'), Meteor.subscribe('contactables')];
  },
  onAfterAction: function() {
    var title = 'Assignments',
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
