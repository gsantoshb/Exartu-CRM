Meteor.methods({
  sendEmail: function (to, subject, content, isHTML) {
    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    EmailManager.sendEmail(to, subject, content, isHTML);
  },
  sendMultiplesEmail: function(email, recipients){
    // Validate parameters
    check(email, {
      subject: String,
      text: String
    });
    check(recipients, [{
      contactableId: String,
      email: Match.Where(function (addr) {
        return SimpleSchema.RegEx.Email.test(addr);
      })
    }]);

    try {
      //return EmailTemplateManager.sendEmailTemplate(templateData, recipients);
      return EmailManager.sendMultiplesEmail(email, recipients)
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});