RegisterController = RouteController.extend({
  template: 'register',
  layout: '',
  onBeforeAction: function () {
    if (Meteor.user()) {
      this.redirect('dashboard');
    }
  },
  onAfterAction: function () {
    var title = 'Sign Up',
      description = 'Create a new Aïda account';
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


var isRegistering = new ReactiveVar(true);
var isSubmitting = new ReactiveVar(false);
var error = new ReactiveVar('');

Template.register.helpers({
  isRegistering: function () {
    return isRegistering.get();
  },
  isSubmitting: function () {
    return isSubmitting.get();
  },
  error: function () {
    return error.get();
  }
});


AutoForm.hooks({
  'registerForm': {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      isSubmitting.set(true);
      Meteor.call('registerAccount', insertDoc, function (err, result) {
        if (err) {
          console.log(err);
          error.set(err.reason);
        } else if (!result) {
          error.set(err.reason);
        } else {
          self.resetForm();
          isRegistering.set(false);
        }
        self.done();
        isSubmitting.set(false);
      });

      return false;
    }
  }
});