Meteor.methods({
  isUsernameAvailable: function(username) {
    return Meteor.users.findOne({ username: username }) == null;
  },

  isEmailAvailable: function(email) {
    return Meteor.users.findOne({ emails: { $elemMatch: { address: email } } }) == null;
  },

  registerAccount: function(document) {
    console.log('test register');
    return false;
  }
});