EmailManager = {
  sendEmail: function (to, subject, content, isHTML) {
    this.unblock();
    var from = Meteor.user();
    if (!from.emails)
      return null;
    from = from.emails[0].address;
    if (!subject)
      subject = '';
    send(to, from, subject, content, isHTML);
  }
};

var send = function (to, from, subject, content, isHTML) {
  check([to, from, subject, content], [String]);
  var email = {
    to: to,
    from: from,
    subject: subject
  };

  if (isHTML)
    email.html = content;
  else
    email.text = content;

  Email.send(email);
};