HierarchyMailController = RouteController.extend({
  template: 'hierarchyMail',

});

Template.hierarchyMail.events = {

}


AutoForm.hooks({
  'setUpHierEmail': {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      Meteor.call('emailListener', insertDoc.email, insertDoc.password, "imap-mail.outlook.com", 993, Meteor.user().currentHierId, function(error, result){
        console.log(result);
        console.log(error);

      });
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