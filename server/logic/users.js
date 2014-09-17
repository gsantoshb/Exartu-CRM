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

      var user = {
        email: document.email,
        password: document.password
      };

      if (document.hierId)
        user.profile = {hierId: document.hierId};

      var userId = Accounts.createUser(user);
      if (!skipEmailVerification) {
        Accounts.sendVerificationEmail(userId);
      } else {
        Meteor.users.update({_id: userId, 'emails.address':  document.email}, {$set: { 'emails.$.verified':  true}});
      }

      return userId;
    }

    return false;
  },
  sendUserInvitation: function (user, hierId) {
    var hier = Hierarchies.findOne(hierId || Meteor.user().hierId);

    var userInvitation = {
      hierId: hier._id,
      email: user.email,
      hierName: hier.configuration.title,
      createdAt: new Date(),
      sentBy: Meteor.userId()
    };

    // Send invitation
    // Generate token
    var shortId = Meteor.require('shortid');
    userInvitation.token = shortId.generate();
    // Send email
    sendInvitation(user.email, userInvitation.token, hier.configuration.title);

    UserInvitations.insert(userInvitation);
  },
  'resendUserInvitation': function(userInvitationId) {
    var userInvitation = UserInvitations.findOne(userInvitationId);
    sendInvitation(userInvitation.email, userInvitation.token, userInvitation.hierName);
  },
  'registerAccountFromInvitation': function(token, user) {
    // Validate token
    var userInvitation = UserInvitations.findOne({token: token, used: {$ne: false}});

    if (!userInvitation)
      throw new Meteor.Error(500, 'Invalid user invitation');

    // Set hierId equal to the user's who send the invitation
    user.hierId = userInvitation.hierId;

    // Register user avoiding email verification
    Meteor.call('registerAccount', user, true);

    markInvitationsAsUsed(userInvitation);
  }
});

var sendInvitation = function(address, token, hierName) {
  var url = Meteor.absoluteUrl('invitation/' + token);
  var html = 'You have been invited to ' + hierName + ', click in the link bellow to accept the invitation: <br/>' +
    '<a href="' + url + '"> </a> '+ url + '<br/>';

  Meteor.call('sendEmail', address ,'TempWorks - Invitation', html, true);
};

var markInvitationsAsUsed = function(userInvitation) {
  // Mark all user invitations with the same hierId and email as used
  UserInvitations.update({hierId: userInvitation.hierId, email: userInvitation.email}, {$set: {used: true}});
};

Router.map(function () {
  // Validate user invitation and redirect to register form if it's ok
  this.route('hierarchyInvitation', {
    where: 'server',
    path: '/invitation/:token',
    action: function () {
      var token = this.params.token;
      var userInvitation = UserInvitations.findOne({token: token, used: {$ne: true}});

      if (!userInvitation ) {
        this.response.writeHead(301, {
          Location: Meteor.absoluteUrl('notfound')
        });
        this.response.end();
        return;
      }

      var user = Meteor.users.findOne({'emails.address': userInvitation.email});

      if (!user) {
        // If there is not user then redirect user to add user form
        this.response.writeHead(301,{
          Location: Meteor.absoluteUrl('users/add?email=' + userInvitation.email + '&token=' + token + '&from=' + userInvitation.hierName)
        });
        this.response.end();
      } else {
        // If there is a user then just add it to the hierarchy specified in user invitation
        Meteor.users.update({_id: user._id}, {$addToSet: { hierarchies: userInvitation.hierId}, $set: {currentHierId: userInvitation.hierId}});

        // Mark invitation as used
        markInvitationsAsUsed(userInvitation);

        // Redirect user to login
        this.response.writeHead(301,{
          Location: Meteor.absoluteUrl('login?email=' + userInvitation.email)
        });
        this.response.end();
      }
    }
  });
});