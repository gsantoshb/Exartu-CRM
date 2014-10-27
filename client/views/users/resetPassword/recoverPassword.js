
var isSending = false;
var isSendingDep = new Tracker.Dependency;
var error = '';
var errorDep = new Tracker.Dependency;

Template.recoverPassword.helpers({
  // Auto form schema
  recoverPassSchema: function () {
    return new SimpleSchema({
      email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email
      }
    });
  },

  // Sending state
  isSending: function () {
    isSendingDep.depend();
    return isSending;
  },

  // Error message
  error: function () {
    errorDep.depend();
    return error;
  }
});

Template.recoverPassword.events({
  // Cancel button
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});


AutoForm.hooks({
  recoverPassForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      // Set current state
      isSending = true;
      isSendingDep.changed();
      error = '';
      errorDep.changed();

      // Send reset password email
      Accounts.forgotPassword({email: insertDoc.email}, function (err) {
        isSending = false;
        isSendingDep.changed();

        if (err) {
          // Update the error message variable
          error = err.error;
          errorDep.changed();
        } else {
          Utils.dismissModal();
        }

        self.done();
      });

      return false;
    }
  }
});