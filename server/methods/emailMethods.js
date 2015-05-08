Meteor.methods({
  sendEmail: function (to, subject, content, isHTML) {
    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    EmailManager.sendEmail(to, subject, content, isHTML);
  },
  sendMultiplesEmail: function(email, hotlist){
    // Validate parameters
    check(email, {
      subject: String,
      text: String
    });
    check(hotlist._id, String

      //email: Match.Where(function (addr) {
      //  return SimpleSchema.RegEx.Email.test(addr);
      //})
    );
    var emailCMTypes = _.pluck(LookUps.find({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: {
        $in: [
          Enums.lookUpAction.ContactMethod_Email,
          Enums.lookUpAction.ContactMethod_PersonalEmail,
          Enums.lookUpAction.ContactMethod_WorkEmail
        ]
      }
    }).fetch(), '_id');
    var members = Contactables.find({_id: {$in: hotlist.members || []}}, {sort: {displayName: 1}}).fetch();
    var recipients = [];
    _.each(members, function (member) {
      var email = _.find(member.contactMethods, function (cm) {
        return _.indexOf(emailCMTypes, cm.type) != -1
      });
      if (email)
        recipients.push({contactableId: member._id, email: email.value});
    });

    try {
      //return EmailTemplateManager.sendEmailTemplate(templateData, recipients);
      return EmailManager.sendMultiplesEmail(email, recipients)
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});