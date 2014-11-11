InvitationController = RouteController.extend({
  template: 'invitation',
  layout: 'mainLayout',
  data: function () {
    return { token: this.params.token };
  }
});

var validating = new ReactiveVar(true);
var invalid = new ReactiveVar(false);

Template.invitation.rendered = function() {
  Meteor.call('acceptUserInvitation', this.data.token, function (error) {
    validating.set(false);
    if (error) {
      invalid.set(true);
    } else {
      // Show notification
      $.gritter.add({
        title:	'Invitation accepted',
        text:	'You can now change to the new hierarchy from the Settings/Hierarchies menu.',
        image: 	'/img/logo.png',
        sticky: false,
        time: 2000
      });

      // Update hierarchies subscription
      HierarchiesHandler = Meteor.subscribe('hierarchies');

      // Redirect the user to the dashboard
      Router.go('/');
    }
  });
};

Template.invitation.helpers({
  isValidating: function () {
    return validating.get();
  },

  isInvalid: function () {
    return invalid.get();
  }
});