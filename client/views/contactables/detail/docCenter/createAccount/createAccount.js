
var contactable;
Template.createHrcAccount.created = function() {
  contactable = _.first(this.data);
};

var error = new ReactiveVar('');
Template.createHrcAccount.helpers({
  email: function () {
    var emailCMTypes =  _.pluck(LookUps.find({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: {$in: [
        Enums.lookUpAction.ContactMethod_Email,
        Enums.lookUpAction.ContactMethod_PersonalEmail,
        Enums.lookUpAction.ContactMethod_WorkEmail
      ]}
    }).fetch(), '_id');

    var email = _.find(contactable.contactMethods, function (cm) {
      return _.indexOf(emailCMTypes, cm.type) != -1
    });

    return email && email.value;
  },
  error: function () {
    return error.get();
  }
});

Template.createHrcAccount.events({
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});

AutoForm.hooks({
  createHrcAccountForm: {
    onSubmit: function (data) {
      var self = this;

      Meteor.call('createHrcAccount', contactable._id, data.email, function(err, result){
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          error.set('Server error. ' + msg);
        } else {
          // Show notification
          $.gritter.add({
            title:	'Account created',
            text:	'An email with the account details to use HRC has been sent to the client.',
            image: 	'/img/logo.png',
            sticky: false,
            time: 2000
          });

          self.done();
          Utils.dismissModal();
        }
      });

      return false;
    }
  }
});
