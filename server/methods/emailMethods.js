Meteor.methods({
  sendEmail: function (to, subject, content, isHTML) {
    EmailManager.sendEmail(to, subject, content, isHTML);
  }
});