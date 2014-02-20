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

var send = function (to, from, subject, text) {
    check([to, from, subject, text], [String]);
    Email.send({
        to: to,
        from: from,
        subject: subject,
        text: text
    });
}

//var sendInvitation = function () {
//
//}
//var sendNotification = function () {}
//var sendActivation = function () {}

Meteor.methods({
    sendEmail: function (to, subject, text) {
        this.unblock();
        var from = Meteor.user();
        if (!from.emails)
            return null;
        from = from.emails[0].address;
        send(to, from, subject, text);
    }
})