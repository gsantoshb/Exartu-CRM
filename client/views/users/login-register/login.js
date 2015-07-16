var addDisabled = new ReactiveVar(false);
LoginController = RouteController.extend({
  template: 'login',
  //layout: '',
  onBeforeAction: function () {
    if (Meteor.user()) {
      this.redirect('dashboard');
    }else{
      this.next();
    }
  },
  data: function() {
    email = this.params.email;
    return this;
  },
  //actions: function () {
  //  this.render();
  //},
  onAfterAction: function() {
    var title = 'Login',
        description = '';
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

var email,
  remindMe,
  lastEmailUsedKey = 'aida.lastEmailUsed';

var notVerified = new ReactiveVar(false),
    errorMessage = new ReactiveVar('');

LoginSchema = new SimpleSchema({
  email:{
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Email"
  },
  password:{
    type: String,
    label: "Password"
  }
});

AutoForm.hooks({
  loginForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      addDisabled.set(true);
      var self = this;
      email = insertDoc.email.toLowerCase();
      Meteor.loginWithPassword({ email: email }, insertDoc.password, function (err, result) {
        addDisabled.set(false);
        if (err) {
          if(err.reason == 'Email not verified') {
            notVerified.set(true);
            errorMessage.set(err.reason);
          }
          else {
            notVerified.set(false);
            errorMessage.set('Email or password is wrong. Try again.');
          }
        }
        else {
          //store email address used if remindMe is checked, remove the stored value otherwise
          if (remindMe){
            localStorage.setItem(lastEmailUsedKey, email);
          } else {
            localStorage.removeItem(lastEmailUsedKey);
          }

          Meteor.call('userLoginActivity');
          notVerified.set(false);
          if (Router.current().route.getName() === 'login') {
            return Router.go('/');
          }
        }
        self.done();

      });
      return false;
    }
  }
});

Template.login.rendered = function(){
  $('body').addClass('login-register');
  $('.has-min-height') .css({'min-height': ($(window).height() - 35)+'px'});
  $(window).resize(function(){
    $('.has-min-height') .css({'min-height': ($(window).height() - 35)+'px'});
  });
};

Template.login.destroyed = function(){
  $('body').removeClass('login-register');
};


Template.login.created = function(){
  addDisabled.set(false);
  remindMe = false;
};

Template.login.helpers({
  addDisabled: function(){
    return addDisabled.get() ? "disabled": "";
  },
  getNotVerified: function () {
    return notVerified.get();
  },
  errorMessage: function () {
    return errorMessage.get();
  },
  intialValues: function () {
    return {
      email: email
    }
  },
  lastEmailUsed: function () {
    return localStorage.getItem(lastEmailUsedKey);
  }
});

Template.login.events({
  'click #resendVerification': function () {
    Meteor.call('resendEmailVerification', email, function(err) {
      if (err) {
        errorMessage.set('Email or password is wrong. Try again.');
      } else
        errorMessage.set('');
      notVerified.set(false);
    });
  },
  'click #googleLogin': function () {
    if (Meteor.loginWithGoogle)
      Meteor.loginWithGoogle({}, function (err) {
        if(err)
          errorMessage.set(err.reason);
        else{
          Meteor.call('userLoginActivity');
          Router.go('/');
        }
      });
  },
  'click #recoverPassword': function () {
    Utils.showModal('recoverPassword');
  },
  'change #remindMe': function (e) {
    remindMe = e.target.checked;
  },

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