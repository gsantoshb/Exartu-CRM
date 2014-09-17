Template.inviteUser.events({
  'click .cancel': function () {
    Utils.dismissModal();
  }
});

AutoForm.hooks({
  addUserForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      Meteor.call('sendUserInvitation', insertDoc, function (err) {
        if (err){
          alert (err.message);
        }
        self.done();
        Utils.dismissModal();
      });

      return false;
    }
  }
});
