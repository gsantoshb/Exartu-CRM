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
      var self = this;
      Meteor.call('registerAccount', insertDoc, function (err, result) {
        if (err) {
          console.log(err);
          error = err.reason;
          errorDep.changed();
        } else if(!result) {
          error = err.reason;
          errorDep.changed();
        } else {
          self.resetForm();
          isRegistering = false;
          registeringDep.changed();
        }
        self.done();
      });

      return false;
    }
  }
});