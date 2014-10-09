AddUserController = RouteController.extend({
  template: 'addUser',
  layout: '',
  data: function() {
    email = this.params.email;
    token = this.params.token;
    hierName = this.params.from;
  }
});

var email, token, hierName;

Template.addUser.userInfo = function() {
  return {email: email};
};

Template.addUser.hierName = function() {
  return hierName;
};

AutoForm.hooks({
  'registerFromInvitation': {
    onSubmit: function (user) {
      var self = this;
      Meteor.call('registerAccountFromInvitation', token, user, function (err, result) {
        if (err) {
          console.log(err);
          error = err.reason;
        } else {
          self.resetForm();
          Meteor.loginWithPassword(user.email, user.password, function() {
            Router.go('dashboard');
          });
        }
        self.done();
      });

      return false;
    }
  }
});