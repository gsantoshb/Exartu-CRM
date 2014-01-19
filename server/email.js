Meteor.startup(function() {
    //process.env.MAIL_URL=ExartuConfig.MAIL_URL;
    Meteor.methods({
        sendEmail: function(email)
        {
            Email.send({
                from: email.from,
                to: email.to,
                subject: email.subject,
                text: email.text,
                html: email.html  //"<b>hello world</b>"
            });
        }
    });
});

