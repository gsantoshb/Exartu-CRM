/**
 * Created by visualaram on 7/8/14.
 */


Emails = new Meteor.Collection("emails", { connection: null });
EmailAccounts = new Meteor.Collection("emailAccounts");

Meteor.publish('emails', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    var emailAccount =  EmailAccounts.findOne({
        userId: this.userId
    });

    if(!emailAccount)
        return false;

    var mailListener = new MailListener2({
        username: emailAccount.username,
        password:emailAccount.password,
        host: emailAccount.host,
        port: emailAccount.port, // imap port
        tls: emailAccount.tls,
        tlsOptions: { rejectUnauthorized: false },
        mailbox: "INBOX", // mailbox to monitor
        markSeen: false, // all fetched email willbe marked as seen and not fetched next time
        fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
        mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
        attachments: true, // download attachments as they are encountered to the project directory
        attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
    });


// stop listening
//mailListener.stop();

    mailListener.on("server:connected", function(){
        console.log("imapConnected");
    });


    mailListener.on("error", function(err){
        console.log(err);
    });

    mailListener.on("mail", Meteor.bindEnvironment(function(mail, seqno, attributes){
        // do something with mail object including attachments
        console.log("emailParsed", mail);
        var existingMail = Emails.findOne({
            messageId: mail.messageId
        });
        if(!existingMail) {
            mail.meteorUserId = emailAccount.userId;
            Emails.insert(mail);
        }

        // mail processing code goes here
    }));

    mailListener.on("attachment", function(attachment){
        console.log(attachment.path);
    });


    mailListener.start(); // start listening

    return Emails.find({
        meteorUserId: this.userId
    });
})
Meteor.publish('emailAccounts', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;


    return EmailAccounts.find({
                userId: this.userId
    });
})

Meteor.methods({
//    'upsertEmailAccount': function(emailAccount){
//        var checkValidAccount = Async.runSync(function(done) {
//            var mailListener = new MailListener2({
//                username: emailAccount.username,
//                password:emailAccount.password,
//                host: emailAccount.host,
//                port: emailAccount.port, // imap port
//                tls: emailAccount.tls,
//                tlsOptions: { rejectUnauthorized: false },
//                mailbox: "INBOX", // mailbox to monitor
//                markSeen: false, // all fetched email willbe marked as seen and not fetched next time
//                fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
//                mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
//                attachments: true, // download attachments as they are encountered to the project directory
//                attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
//            });
//
//            mailListener.on("server:connected", Meteor.bindEnvironment(function(mail, seqno, attributes){
//                mailListener.stop();
//                var currentAccount =  EmailAccounts.findOne({
//                    userId: Meteor.userId()
//                });
//                if(currentAccount){
//                    EmailAccounts.update({_id:currentAccount._id},{
//                        $set:{
//                            username: emailAccount.username,
//                            password:emailAccount.password,
//                            host: emailAccount.host,
//                            port: emailAccount.port,
//                            tls: emailAccount.tls
//                        }
//                    })
//                }
//                else{
//                    emailAccount.userId = Meteor.userId();
//                    EmailAccounts.insert(emailAccount);
//                }
//                done(null,"Connection Succeeded");
//            }));
//
//            mailListener.on("error", function(err){
//                done(new Meteor.Error(500, err.toString()),null);
//                mailListener.stop();
//            });
//
//            mailListener.start();
//
//        });
//
//
//        if(checkValidAccount.error)
//            throw checkValidAccount.error;
//        else
//            return checkValidAccount.result;
//    }
});
