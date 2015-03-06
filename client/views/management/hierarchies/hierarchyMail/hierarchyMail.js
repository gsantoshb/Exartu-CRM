HierarchyMailController = RouteController.extend({
  template: 'hierarchyMail',

});

Template.hierarchyMail.events = {

}

var error = new ReactiveVar('');

Template.hierarchyMail.helpers({
  error: function () {
    return error.get();
  }
});


AutoForm.hooks({
  'setUpHierEmail': {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      error.set('');
      var self = this;
      var arrayEmail = insertDoc.email.split('@');
      var imapServer;
      var port;
      switch(arrayEmail[1]){
        case 'hotmail.com':
        case 'live.com':
        case 'outlook.com':
          imapServer = 'imap-mail.outlook.com';
          port = 993;
          break;
        case 'gmail.com':
          imapServer = 'imap.gmail.com';
          port = 993;
          break;
        case 'yahoo.com':
          imapServer = 'imap.mail.yahoo.com';
          port = 993;
          break;
      }
      if(imapServer && port) {
        console.log(imapServer);
        console.log(port);
        Meteor.call('emailListener', insertDoc.email, insertDoc.password, "imap-mail.outlook.com", 993, Meteor.user().currentHierId, function (err, result) {
          if (result === 'OK') {

            Meteor.call('setCurrentHierarchyMailConf', insertDoc.email, insertDoc.password, "imap-mail.outlook.com", 993);
            self.done();

          }
          if (err) {
            error.set('Invalid email or password');
            self.done('error');

          }

        });
      }
      else{
        self.done('error');
        error.set('email must end with  @gmail.com, @hotmail.com, @yahoo.com, @live.com or @outlook.com');

      }
      // hotmail, gmail, yahoo
      //
      //Meteor.call('registerAccount', insertDoc, function (err, result) {
      //  if (err) {
      //    console.log(err);
      //    error.set(err.reason);
      //  } else if (!result) {
      //    error.set('Email is already in use by another account');
      //  } else {
      //    self.resetForm();
      //    isRegistering.set(false);
      //  }
      //  self.done();
      //  isSubmitting.set(false);
      //});

      return false;
    }
  }
});