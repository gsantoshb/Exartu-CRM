EmailManager = {
  sendEmail: function (to, subject, content, isHTML) {
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

var emailListener =  Meteor.wrapAsync(function (email, pass, host, port, hierId, cb) {

  //find all news emails for hierId hierarchy:
  var mailListener = new MailListener({
    username: email,//"lidnele4321@hotmail.com"
    password: pass, //"ram123.R"
    host: host,//"imap-mail.outlook.com"
    port: port, //993 (imap port)
    tls: true,
    mailbox: "INBOX", // mailbox to monitor
    markSeen: false // all fetched email willbe marked as seen and not fetched next time

  });


  mailListener.start();

  mailListener.on("server:connected", function () {
    console.log("imapConnected");
    cb(null,'OK');
  });

  mailListener.on("mail", function (mail, seqno, attributes) {
    // do something with mail object including attachments
    //console.log("emailParsed1", mail);
    var contactable = ContactableManager.getContactableByMail( mail.from[0].address, hierId);
    if(contactable) {
      console.log("from", mail.from[0].address);
      console.log("to", mail.to[0].address);
      console.log("mensaje", mail.text);
      console.log("subject", mail.subject);
      var note = {};
      note.msg = mail.subject +". "+mail.text;
      note.hierId = hierId;
      note.userId = contactable.userId;
      //preguntar
      note.links = [{id: contactable._id, type: Enums.linkTypes.contactable.value}];

      //var note = function(){
      //  this.msg = mail.subject +". "+mail.text;
      //  this.hierId = hierId;
      //  this.userId = contactable.userId;
      //  this.testData = true;
      //  //preguntar
      //  this.links = [{id: contactable._id, type: 0}];
      //};
      //ContactableManager.addNote(note);
      NoteManager.addNote(note);
    }
    //else{
    //  console.log("sali por el else");
    //}

    //cb(null, mail);
    // mail processing code goes here
  });

  mailListener.on("error", function (err) {
    console.log(err);
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
  return mailListener ? 'OK' : error;
});

Meteor.methods({
  emailListener: emailListener

});


var asd = {
  html: '<html>\n<head>\n<style><!--\n.hmmessage P\n{\nmargin:0px;\npadding:0px\n}\nbody.hmmessage\n{\nfont-size: 12pt;\nfont-family:Calibri\n}\n--></style></head>\n<body class=\'hmmessage\'><div dir=\'ltr\'>prueba12 \t\t \t   \t\t  </div></body>\n</html>',
  text: 'prueba12 \t\t \t   \t\t  ',
  headers: {
    'x-store-info': 'Ru8Mzrcu9Bi87krfImffoGU6zyI7zQxEoIu1O5H/jK2iVEobkBR0o//8+3SBNKP37fXnPzcox0fAzEsyvD/v8bFo2rDCuRiAFE+DcuEVaWp6/uUt7aLiGuTgoYF3s3YCBEas/g4+dFU=',
    'authentication-results': 'hotmail.com; spf=pass (sender IP is 65.55.90.102; identity alignment result is pass and alignment mode is relaxed) smtp.mailfrom=lidnele4321@hotmail.com; dkim=none (identity alignment result is pass and alignment mode is relaxed) header.d=hotmail.com; x-hmca=pass header.id=lidnele4321@hotmail.com',
    'x-sid-pra': 'lidnele4321@hotmail.com',
    'x-auth-result': 'PASS',
    'x-sid-result': 'PASS',
    'x-message-status': 'n:n',
    'x-message-delivery': 'Vj0xLjE7dXM9MTtsPTE7YT0wO0Q9MDtHRD0wO1NDTD0w',
    'x-message-info': 'AuEzbeVr9u6HQKaFYM906OMqZvmop9aoV39z7O54cTAiXqUUlYksEf01M3ruQgkWp00wmfQiKzxbqmFSELsG1+DxAtMZqAHIvJqoeb3aRK4bGo4tnVNjejnCnqk0NSdsT292qC/LRO5BbAid2fUJ1PN8JCg2YaQdo0ui/oNa0aElkOF5L3LUeA7YAWzhv1VPRmdzFnhaxCoCIEOnt5tqt4zGRlEXlu8V',
    received: ['from SNT004-OMC2S27.hotmail.com ([65.55.90.102]) by SNT004-MC4F21.hotmail.com over TLS secured channel with Microsoft SMTPSVC(7.5.7601.22751); Tue, 3 Mar 2015 11:45:42 -0800',
      'from SNT148-W20 ([65.55.90.71]) by SNT004-OMC2S27.hotmail.com over TLS secured channel with Microsoft SMTPSVC(7.5.7601.22751); Tue, 3 Mar 2015 11:45:41 -0800'],
    'x-tmn': '[6g8H4zr8CETucmSczRJJQ8w7mUU8xmVJ]',
    'x-originating-email': '[lidnele4321@hotmail.com]',
    'message-id': '<SNT148-W2004C0309904921446D065A8110@phx.gbl>',
    'return-path': 'lidnele4321@hotmail.com',
    'content-type': 'multipart/alternative; boundary="_00316a55-2a07-419f-b8fa-2a6918470b59_"',
    from: 'rrrrrrrrrrr aaaaaaaaaaa <lidnele4321@hotmail.com>',
    sender: '<outlook_df18f46d13f1dc90@outlook.com>',
    to: 'rrrrrrrrrrr aaaaaaaaaaa <lidnele4321@hotmail.com>',
    subject: 'pruaba12',
    date: 'Tue, 3 Mar 2015 14:45:41 -0500',
    importance: 'normal',
    'mime-version': '1.0',
    'x-originalarrivaltime': '03 Mar 2015 19:45:41.0728 (UTC) FILETIME=[A1B27600:01D055EA]'
  },
  subject: 'pruaba12',
  messageId: 'SNT148-W2004C0309904921446D065A8110@phx.gbl',
  priority: 'normal',
  from: [{
    address: 'lidnele4321@hotmail.com',
    name: 'rrrrrrrrrrr aaaaaaaaaaa'
  }],
  to: [{
    address: 'lidnele4321@hotmail.com',
    name: 'rrrrrrrrrrr aaaaaaaaaaa'
  }],
  date: 'Tue Mar 03 2015 17:45:41 GMT-0200 (UYST)'
}
