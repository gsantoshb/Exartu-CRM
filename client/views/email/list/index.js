


Template.emailListTemplate.created = function() {
};

Template.emailListTemplate.emails = function () {
  return Emails.find();
};
Template.emailListTemplate.hasAccount = function () {
    return _.isObject(EmailAccounts.findOne({
        userId: Meteor.userId()
    }));
};


