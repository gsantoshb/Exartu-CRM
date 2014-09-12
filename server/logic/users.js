Meteor.methods({
  isUsernameAvailable: function (username) {
    return Meteor.users.findOne({ username: username }) == null;
  },

  isEmailAvailable: function (email) {
    return Meteor.users.findOne({ emails: { $elemMatch: { address: email } } }) == null;
  },

  registerAccount: function (document, skipEmailVerification) {
    // Check username and email
    //if (Meteor.call('isUsernameAvailable', document.username) &&
    //    Meteor.call('isEmailAvailable', document.email)) {
    if (Meteor.call('isEmailAvailable', document.email)) {

      // Create account
      //var userId = Accounts.createUser({ username: document.username, email: document.email, password: document.password });
      var userId = Accounts.createUser({ email: document.email, password: document.password });
      if (!skipEmailVerification) {
        Accounts.sendVerificationEmail(userId);
      } else {
        Meteor.users.update({_id: userId, 'emails.address':  document.email}, {$set: { 'emails.$.verified':  true}});
      }

      return userId;
    }

    return false;
  }
});