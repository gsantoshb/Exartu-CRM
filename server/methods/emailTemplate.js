
Meteor.methods({
  sendEmailTemplate: function (templateData, hotlist) {
    // Validate parameters
    check(templateData, {
      templateId: String,
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
    var membersIds = _.pluck(hotlist.members,'id');
    var members = Contactables.find({_id: {$in: membersIds || []}}, {sort: {displayName: 1}}).fetch();
    var recipients = [];
    _.each(members, function (member) {
      var email = _.find(member.contactMethods, function (cm) {
        return _.indexOf(emailCMTypes, cm.type) != -1
      });
      if (email)
        recipients.push({contactableId: member._id, email: email.value});
    });

    try {
      return EmailTemplateManager.sendEmailTemplate(templateData, recipients);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },
  sendEmailTemplateToContactables: function (templateData, recipientArray) {
    // Validate parameters
    check(templateData, {
      templateId:  Match.Optional(String),
      subject: String,
      text: String
    });
    check(recipientArray, Array);

    try {
      if (templateData.templateId){
        return EmailTemplateManager.sendEmailTemplate(templateData, recipientArray);
      }else{
        return EmailManager.sendMultiplesEmail(templateData, recipientArray)
      }
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});
