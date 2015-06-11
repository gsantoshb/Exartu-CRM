  hierarchyListener = {};

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
  sendMultiplesEmail: function(email, recipients){
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

var emailListener =  Meteor.wrapAsync(function (email, pass, host, port, hierId, cb) {

  var hierarchy = Hierarchies.findOne({_id: hierId});
  //set by default a minimum date
  var date ='April 1, 1962';
  //console.log(date);
  if(!hierarchy){
    throw new Error('hierarchy not found');
  }
  else{
    date = hierarchy.mailSubscription.date || date;
  }


  //find all news emails for hierId hierarchy:
  var mailListener = new MailListener({
    username: email,//"lidnele4321@hotmail.com"
    password: pass, //"ram123.R"
    host: host,//"imap-mail.outlook.com"
    port: port, //993 (imap port)
    tls: true,
    fetchUnreadOnStart: true,
    mailbox: "INBOX", // mailbox to monitor
    markSeen: false, // all fetched email willbe marked as seen and not fetched next time
    searchFilter:['ALL', ['SINCE', date]]

  });


  mailListener.start();

  mailListener.on("server:connected", function () {
    console.log("imapConnected");
    cb(null,'OK');
    hierarchyListener[hierId] = mailListener;
  });

  mailListener.on("mail", function (mail, seqno, attributes) {
    // do something with mail object including attachments
    //console.log("emailParsed1", mail);
    var dateMail = new Date(mail.date);
    var lastDate = new Date(date);
    if(dateMail>lastDate) {
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

var listListener = function(){
  return _.keys(hierarchyListener);
}

Meteor.methods({
  emailListener: emailListener,
  listListener: listListener

});


