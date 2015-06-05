SMSReceived = new Mongo.Collection('smsReceived');

SMSReceived.find().observeChanges({
  added: function (id, fields) {
    $.gritter.add({
      title:	fields.contactableName || 'New SMS',
      text:	fields.msg,
      image: 	'/img/logo.png',
      sticky: false,
      time: 2000
    });
  }
});