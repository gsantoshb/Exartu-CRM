
EmailTemplateManager = {
  createTemplate: function (template) {
    return EmailTemplates.insert(template);
  },
  sendEmailTemplate: function (templateData, recipients) {
    // Validate parameters
    if (!templateData) throw new Error('Template text is required');
    if (!recipients || recipients.length < 1) throw new Error('At least one recipient is required');

    var template = EmailTemplates.findOne(templateData.templateId);
    if (!template) throw new Error('Invalid template ID');

    _.each(recipients, function (recipient) {
      // Get the contactable
      var contactable = Contactables.findOne({_id: recipient.contactableId});
      if (contactable) {
        // Get an instance of the template for this contactable
        var text = MergeFieldHelper.getInstance(templateData.text, contactable);

        // Send the email
        var subject = templateData.subject;
        EmailManager.sendEmail(recipient.email, subject, text, true);
      }
    });
  }
};

