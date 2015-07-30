hierarchyListener = {};

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

EmailManager = {
  sendEmail: function (to, subject, content, isHTML) {
    var from = Meteor.user();
    if (!from.emails)
      return null;
    from = from.emails[0].address;
    if (!subject)
      subject = '';
    send(to, from, subject, content, isHTML);
  },
  sendMultiplesEmail: function (email, recipients) {
    if (!email) throw new Error('Email is required');
    if (!recipients || recipients.length < 1) throw new Error('At least one recipient is required');

    _.each(recipients, function (recipient) {
      // Get the contactable
      var contactable = Contactables.findOne({_id: recipient.contactableId});
      if (contactable) {
        // Send the email
        EmailManager.sendEmail(recipient.email, email.subject, email.text, true);

        NoteManager.addNote({
          msg: email.text,
          links: [{type: Enums.linkTypes.contactable.value, id: contactable._id}],
          isEmail: true
        })
      }
    });
  },
  send: send
};

var emailListener = Meteor.wrapAsync(function (email, pass, host, port, hierId, cb) {

  var hierarchy = Hierarchies.findOne({_id: hierId});
  //set by default a minimum date
  var date = 'April 1, 1962';
  //console.log(date);
  if (!hierarchy) {
    throw new Error('hierarchy not found');
  }
  else {
    date = hierarchy.mailSubscription.date || date;
  }


  //find all news emails for hierId hierarchy:
  var mailListener = new MailListener({
    username: email,
    password: pass,
    host: host,
    port: port,
    tls: true,
    fetchUnreadOnStart: true,
    mailbox: "INBOX",
    markSeen: false,
    searchFilter: ['ALL', ['SINCE', date]]
  });


  mailListener.start();

  mailListener.on("server:connected", function () {
    console.log("imapConnected");
    cb(null, 'OK');
    hierarchyListener[hierId] = mailListener;
  });

  mailListener.on("mail", function (mail, seqno, attributes) {
    // do something with mail object including attachments
    //console.log("emailParsed1", mail);
    var dateMail = new Date(mail.date);
    var lastDate = new Date(date);
    if (dateMail > lastDate) {
      var contactable = ContactableManager.getContactableByMail(mail.from[0].address, hierId);
      if (contactable) {
        //console.log("from", mail.from[0].address);
        //console.log("to", mail.to[0].address);
        //console.log("mensaje", mail.text);
        //console.log("subject", mail.subject);
        //console.log("mail: ", mail);
        var note = {};
        note.msg = mail.subject + ". " + mail.text;
        note.hierId = hierId;
        note.userId = contactable.userId;
        note.links = [{id: contactable._id, type: Enums.linkTypes.contactable.value}];
        NoteManager.addNote(note);
      }
      //actualize lastDate

      Hierarchies.update({_id: hierId}, {$set: {'mailSubscription.date': mail.date}});
      date = mail.date;

    }
    //else{
    //  console.log("sali por el else");
    //}
  });

  mailListener.on("error", function (err) {
    //console.log(err);
    cb(err);
  });
  mailListener.on("mail:arrived", function (id) {
    console.log("new mail arrived with id:" + id);
  });

  mailListener.on("mail:parsed", function (mail) {
    // do something with mail object including attachments
    //console.log("emailParsed2", mail.attachments);
    // mail processing code goes here
  });
  //save the hierarchy listener into the hash

});

EmailManager.emailListenerResumeParser = function (email, pass, host, port, onErrorCallback) {

  onErrorCallback = onErrorCallback || function (e) {
    console.log('resume parser not connected', e);
  }
  //set by default a minimum date

  //find all news emails for hierId hierarchy:
  var mailListener = new MailListener({
    username: email,
    password: pass,
    host: host,
    port: port,
    tls: true,
    fetchUnreadOnStart: true,
    mailbox: "INBOX",
    markSeen: false,
    searchFilter: ['UNSEEN']
  });


  mailListener.start();

  mailListener.on("server:connected", function () {
    console.log("imapConnected");
  });

  mailListener.on("server:disconnected", onErrorCallback);

  mailListener.on("mail", function (mail, seqno, attributes) {
    console.log('Resume received');
    //console.log("emailParsed1", mail);
    mailListener.imap.setFlags('*', 'SEEN', function (err) {
      err && console.log('Error setting flags', err);
    });
    var to = mail.to[0].address;
    var arrayToMore = to.split("+");
    if (arrayToMore[1]) {
      var arrayToA = arrayToMore[1].split("@");
      var hierName = arrayToA[0];
      var hier = Hierarchies.findOne({'configuration.webName': hierName});
      if (hier) {
        var user = {};
        if (hier.resumeParserUser === undefined) {
          var userId = UserManager.registerAccount({
            name: 'resumeParserService',
            email: 'resumes-' + hier.configuration.webName + '@aidacreative.com',
            currentHierId: hier._id,
            password: Random.id(8),
            language: null,
            phone: '0000000'
          }, true);
          Meteor.users.update({_id: userId}, {$set: {inactive: true}});
          user = Meteor.users.findOne({_id: userId});
          Hierarchies.update({_id: hier._id}, {$set: {resumeParserUser: user._id}});
        }
        else {
          var userId = hier.resumeParserUser;
          user = Meteor.users.findOne({_id: userId});
        }
        var connection = new RESTAPI.connection(user);


        var successParsed = false;
        _.each(mail.attachments, function (a) {
          var splitName = a.fileName.split(".");
          var extension = splitName[splitName.length - 1];
          var ret = connection.call('resumeParserMethod', {
            fileData: a.content.toString('base64'),
            contentType: a.contentType,
            extension: extension,
            fileName: a.fileName
          });
          if (ret) {
            successParsed = true;
            var text = "";
            if (mail.text) {
              text = mail.text;
            }
            if (!text.match(/(\w)+/i)) {
              text = 'Email text empty';
            }
            var note = {
              msg: text,
              links: [{id: ret, type: Enums.linkTypes.contactable.value}],
              contactableId: ret
            };
            connection.call('addContactableNote', note)

          }
          else {
            successParsed = successParsed || false;
          }
        })
        connection.close();


        if (successParsed) {
          mailListener.imap.move(seqno, "parsed");
        }
        else {
          //error parsing
          mailListener.imap.move(seqno, "failToParse");
          EmailManager.send(mail.from[0].address, to, "Error parsing resumee", "Error creating the employee from resumee, please check the attached file is correct.", false);
        }
      } else {
        //no hierarchy found
        mailListener.imap.move(seqno, "failToParse");
        EmailManager.send(mail.from[0].address, to, "Resumee parser email", "Please check the email address is correct.", false);
      }
    } else {
      //no hierarchy provided
      mailListener.imap.move(seqno, "failToParse");
      EmailManager.send(mail.from[0].address, to, "Resumee parser email", "Please check the email address is correct.", false);

    }
  });

  mailListener.on("error", onErrorCallback);
  mailListener.on("mail:arrived", function (id) {
    console.log("new mail arrived with id:" + id);
  });

  mailListener.on("mail:parsed", function (mail) {
    // do something with mail object including attachments
    //console.log("emailParsed2", mail.attachments);
    // mail processing code goes here
  });
  //save the hierarchy listener into the hash

};

var listListener = function () {
  return _.keys(hierarchyListener);
}

Meteor.methods({
  emailListener: emailListener,
  listListener: listListener
});


