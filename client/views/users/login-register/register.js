RegisterController = RouteController.extend({
  template: 'register',
  onBeforeAction: function () {
    if (Meteor.user()) {
      this.redirect('dashboard');
    }else{
      this.next();
    };
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

Template.register.rendered = function(){
  $('body').addClass('login-register');
};

Template.register.destroyed = function(){
  $('body').removeClass('login-register');
};

Template.register.helpers({
  isRegistering: function () {
    return isRegistering.get();
  },
  isSubmitting: function () {
    return isSubmitting.get();
  },
  error: function () {
    return error.get();
  },
  languageOptions: function() {
      return [
          {label: "English", value: "en"},
          {label: "Español", value: "es"},
          {label: "简体中文", value: "cn"}
      ];
  }
});

Template.register.events({
  'focus .smartField': function(e){
    var label = $('#'+$(e.currentTarget).attr('data-label'));
    label.removeClass('on').addClass('on');
  },
  'keyup .smartField': function(e){
    var label = $('#'+$(e.currentTarget).attr('data-label'));
    label.removeClass('show');
    if($(e.currentTarget).val()){
      label.addClass('show');
    }
  },
  'blur .smartField': function(e){
    var label = $('#'+$(e.currentTarget).attr('data-label'));
    label.removeClass('on');
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
          error.set('Email is already in use by another account');
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