Template.addUser.events({
  'click .cancel': function () {
    Utils.dismissModal();
  }
});

AutoForm.hooks({
  addUserForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      Meteor.call('addHierUser', insertDoc, function () {
        self.done();
        Utils.dismissModal();
      });

      return false;
    }
  }
});
