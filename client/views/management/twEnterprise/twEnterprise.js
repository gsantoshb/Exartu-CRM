
TwEnterprisetController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'twEnterprise'
});


var error = new ReactiveVar(''),
    isSubmitting = new ReactiveVar(false);

Template.twEnterprise.helpers({
  isSubmitting: function () {
    return isSubmitting.get();
  },
  error: function () {
    return error.get();
  },
  doc: function () {
    var hier = Hierarchies.findOne({_id: Meteor.user().currentHierId});
    return hier.enterpriseAccount ? {username: hier.enterpriseAccount.username} : {username: ''};
  }
});


AutoForm.hooks({
  setTwEnterpriseForm: {
    onSubmit: function(insertDoc) {
      var self = this;

      // Clean schema for auto and default values
      TwEnterpriseUserSchema.clean(insertDoc);

      // Clear error message
      error.set('');

      // Set up enterprise account
      isSubmitting.set(true);
      Meteor.call('setTwEnterpriseAccount', insertDoc, function (err) {
        isSubmitting.set(false);
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          error.set('Server error. ' + msg);
        } else {
          self.done();
          // Show notification
          $.gritter.add({
            title:	'TW Enterprise configured',
            text:	'Enterprise account information for this hieararchy have been successfully saved.',
            image: 	'/img/logo.png',
            sticky: false,
            time: 2000
          });
        }
      });

      return false;
    }
  }
});