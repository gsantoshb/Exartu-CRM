Meteor.methods({
  sendEmail: function (to, subject, content, isHTML) {
    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    EmailManager.sendEmail(to, subject, content, isHTML);
  }
});