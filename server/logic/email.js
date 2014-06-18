//(function (to, from, subject, text) {
//    check([to, from, subject, text], [String]);
//
//    // Let other method calls from the same client start running,
//    // without waiting for the email sending to complete.
//    this.unblock();
//
//    Email.send({
//      to: to,
//      from: from,
//      subject: subject,
//      text: text
//    }));

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

//var sendInvitation = function () {
//
//}
//var sendNotification = function () {}
//var sendActivation = function () {}

Meteor.methods({
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
})