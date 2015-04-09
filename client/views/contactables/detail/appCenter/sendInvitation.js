var contactable;
Template.sendAppCenterInvitation.created = function() {
  contactable = _.first(this.data);
};

var error = new ReactiveVar('');
Template.sendAppCenterInvitation.helpers({
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
  alreadyInvited: function () {
    // Invited users have the invitation property set
    return !!contactable.invitation;
  },
  error: function () {
    return error.get();
  }
});

Template.sendAppCenterInvitation.events({
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});

AutoForm.hooks({
  sendAppCenterInvitationForm: {
    onSubmit: function (data) {
      var self = this;

      Meteor.call('inviteEmployeeToAppCenter', contactable._id, data.email, function(err, result){
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          error.set('Server error. ' + msg);
        } else {
          // Show notification
          $.gritter.add({
            title:	'Invitation sent',
            text:	'An invitation email to join Applicant Center has been sent to the employee.',
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