
Meteor.methods({
  sendEmailTemplate: function (templateData, recipients) {
    // Validate parameters
    check(templateData, {
      templateId: String,
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
      return EmailTemplateManager.sendEmailTemplate(templateData, recipients);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});
