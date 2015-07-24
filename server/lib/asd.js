

WorkerManager = {
  handleJob: function () {

    var email = ExartuConfig.ResumeParserEmail,
      pass = ExartuConfig.ResumeParserEmailPassword,
      host = "imap.gmail.com",
      port = 993;


    var mailListener = new MailListener({
      username: email,//"lidnele4321@hotmail.com"
      password: pass, //"ram123.R"
      host: host,//"imap-mail.outlook.com"
      port: port, //993 (imap port)
      tls: true,
      fetchUnreadOnStart: true,
      mailbox: "INBOX", // mailbox to monitor
      markSeen: false, // all fetched email willbe marked as seen and not fetched next time
      searchFilter: ['UNSEEN']
    });


    mailListener.start();

    mailListener.on("server:connected", function () {
      console.log("imapConnected");

    });

    mailListener.on("server:disconnected", function () {
      console.log("imapDisconnected");
      mailListener.start();

    });

    mailListener.on("server:disconnected", function () {
      console.log("imapDisconnected");
      mailListener.start();

    });

    mailListener.on("mail", function (mail, seqno, attributes) {
      // do something with mail object including attachments
      console.log('mail received');
    });
  }
};