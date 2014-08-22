RegisterController =  RouteController.extend({
  template: 'register',
  layout: '',
  onBeforeAction: function () {
    if (Meteor.user()) {
      this.redirect('dashboard');
    }
  },
  onAfterAction: function() {
    var title = 'Sign Up',
      description = 'Create a new Exartu account';
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



var isRegistering = true,
  registeringDep = new Deps.Dependency;
var error= '',
  errorDep = new Deps.Dependency;

Template.register.helpers({
  isRegistering: function () {
    registeringDep.depend();
    return isRegistering;
  },
  error:function(){
    errorDep.depend();
    return error;
  }
});


AutoForm.hooks({
  'registerForm': {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      // Remove confirmation password
      var user= insertDoc;
      delete user.confirmPassword;

      // Create account
      Accounts.createUser(user, _.bind(function (err, result) {
        this.done();

        if (err) {
          console.log(err);
          error = err.reason;
          errorDep.changed();
        } else {
          this.resetForm();
          Router.go('/');
        }
      }, this));

      return false;
    }
  }
});