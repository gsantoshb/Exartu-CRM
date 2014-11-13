UserManager = {
  getUserInformation: function (userId) {
    var user = Meteor.users.findOne({
      _id: userId
    });

    if (user == undefined)
      return null;

    var info = {};

    info.username = user.username || undefined;
    if (user.emails)
      info.email = user.emails[0].address;
    if (user.services) {
      if (user.services.google) {
        info.picture = user.services.google.picture;
      }
    }
    return info;
  },
  checkUniqueness: function (query) {
    return Meteor.users.findOne(query) == null;
  },
  updateUserPicture: function (fileId) {
    console.log("user picture updated");

    Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $set: {
        profilePictureId: fileId
      }
    });
  },
  resendEmailVerification: function(email) {
    var user = Meteor.users.findOne({'emails.address': email});

    if (!user)
      throw new Meteor.Error(500, 'User does not exist');

    Accounts.sendVerificationEmail(user._id);
  },
  updateEmailVerification: function(email) {
    var shortId = Meteor.npmRequire('shortid');
    var token = shortId.generate();
    var url = Meteor.absoluteUrl('emailverification/' + token);
    var html = 'Email verification, click in the link bellow to active your new email: <br/>' +
      '<a href="' + url + '"> </a> '+ url + '<br/>' +
      'Once you verified this email your previous email will be disabled';

    Meteor.users.update({_id: Meteor.userId()},
      {
        $pull: {
          emails: {
            token: {
              $exists: true
            },
            $not: {
              token: null
            }
          }
        }
      }
    );

    Meteor.users.update({_id: Meteor.userId(), 'emails.address': email }, {$set: { 'emails.$.token': token }});

    EmailManager.sendEmail(email, 'TempWorks - Email verification', html, true);
  },
  setLastCustomerUsed: function(id){
    if (! Contactables.findOne({_id: id, Customer: {$exists: true}})){
      throw new Meteor.Error(400,'Customer Not found')
    }
    Meteor.users.update({ _id: Meteor.userId() },{ $set: {lastCustomerUsed: id} });
  },
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
    var hier = Hierarchies.findOne(hierId || Meteor.user().currentHierId);

    var userInvitation = {
      hierId: hier._id,
      email: user.email,
      hierName: hier.configuration.title,
      createdAt: new Date(),
      sentBy: Meteor.userId()
    };

    // Send invitation
    // Generate token
    var shortId = Meteor.npmRequire('shortid');
    userInvitation.token = shortId.generate();
    // Send email
    sendInvitation(user.email, userInvitation.token, hier.configuration.title);

    UserInvitations.insert(userInvitation);
  },
  resendUserInvitation: function(userInvitationId) {
    var userInvitation = UserInvitations.findOne(userInvitationId);
    sendInvitation(userInvitation.email, userInvitation.token, userInvitation.hierName);
  },
  registerAccountFromInvitation: function(token, user) {
    // Validate token
    var userInvitation = UserInvitations.findOne({token: token, used: {$ne: true}});

    if (!userInvitation)
      throw Error(500, 'Invalid user invitation');

    // Set hierId equal to the user's who send the invitation
    user.hierId = userInvitation.hierId;

    // Register user avoiding email verification
    Meteor.call('registerAccount', user, true);

    markInvitationsAsUsed(userInvitation);
  },
  acceptUserInvitation: function (token, user) {
    // Validate token
    var userInvitation = UserInvitations.findOne({token: token, used: {$ne: true}});
    if (!userInvitation)
      throw new Error('Invalid user invitation');

    // Validate user
    var invitedUser = Meteor.users.findOne({'emails.address': userInvitation.email});
    if (user._id != invitedUser._id)
      throw new Error('Invalid user invitation');

    // Add the hierarchy specified in user invitation to the user
    Meteor.users.update({_id: user._id}, { $addToSet: { hierarchies: userInvitation.hierId } });

    // Mark invitation as used
    markInvitationsAsUsed(userInvitation);
  }
};

// Hooks

Accounts.validateLoginAttempt(function(attempt) {
  if (!attempt.allowed)
    return false;
  if (attempt.user.inactive) return false;

  // Users from applicantCenter
  if (attempt.user.origin){
    throw new Meteor.Error(403, 'User not found');
  }

  if (attempt.type == 'password' && !attempt.user.emails[0].verified)
    throw new Meteor.Error(500, 'Email not verified');
  return true;
});

Accounts.onCreateUser(function (options, user) {
  var hierId = '';
  var userEmail = options.email;
  var roles = options.roles;

  if (user.services) {
    if (user.services.google) {
      //TODO: check if the account is already in the database
      userEmail = user.services.google.email;
      user.username = user.services.google.name;
      user.emails = [
        {
          "address": userEmail,
          "verified": true
        }
      ];
    }
  }

  if (!options.profile || !options.profile.hierId) {
    var userRoles = [];
    var userPermissions = [];

    hierId = Meteor.call('createHier', {
      name: userEmail.split('@')[0]
    });

    // Send email to sales
    sendEmailToSales(user);

    user._id = Meteor.uuid();
  } else {
    hierId = options.profile.hierId;
  }

  if (!user.permissions) {
    var userPermissions = [];
    _.forEach(options.roles, function (role) {
      var dbrole = Roles.findOne({
        name: role.name
      });
      if (dbrole){
        user.permissions = _.uniq(userPermissions.concat(dbrole.rolePermissions));
      }
    });
  }

  user.roles = roles;
  user.hierId = hierId;
  user.hierarchies = [hierId];
  user.currentHierId = hierId;

  Hierarchies.update({
    _id: user.hierId
  }, {
    $addToSet: {
      users: user._id
    }
  });

  return user;
});

// Helpers

var sendInvitation = function(address, token, hierName) {
  var url = Meteor.absoluteUrl('invitation/' + token);
  var text = "Dear user,\n\n"
    + "You have been invited to the hierarchy '" + hierName + "'.\n"
    + "Please click the link below to accept the invitation. Alternatively, copy the link into your browser.\n\n"
    + url + "\n\n"
    + "Thank you,\n"
    + "Exartu team";

  EmailManager.sendEmail(address, 'TempWorks - Invitation', text, false);
};

var sendEmailToSales = function(user){
  if (process.env.RELEASE){
    var email = {
      to: 'sales@exartu.com',
      from: 'server@exartu.com',
      subject: 'new user in Exartu',
      text: 'A new user has registered on crm.exartu.com\n\n' +
      'With email: ' + user.emails[0].address + '\n' +
      'User name: ' + user.username + '\n' +
      'Date: '+ user.createdAt
    };

    Email.send(email);
  }
};

var markInvitationsAsUsed = function(userInvitation) {
  // Mark all user invitations with the same hierId and email as used
  UserInvitations.update({hierId: userInvitation.hierId, email: userInvitation.email}, {$set: {used: true}});
};

// Email validation template
Accounts.emailTemplates.siteName = "Exartu ";
Accounts.emailTemplates.from = "Exartu team<exartu.developer@gmail.com>";
Accounts.emailTemplates.enrollAccount.subject = function (user) {
  return "Welcome to CRM Exartu, " + user.profile.name;
};
Accounts.emailTemplates.enrollAccount.text = function (user, url) {
  return "You have been selected to participate in building a better future!"
  + " To activate your account, simply click the link below:\n\n"
  + url;
};

// Email reset password template
Accounts.emailTemplates.resetPassword.subject = function (user) {
  return "Confirm your password reset request";
};
Accounts.emailTemplates.resetPassword.text = function (user, url) {
  return "Dear user,\n\n"
    + "We have received a request to reset the password for your Exartu account.\n"
    + "Please click the link below to set your new password. Alternatively, copy the link into your browser.\n\n"
    + url + "\n\n"
    + "If you have not requested it, please dismiss this email.\n\n"
    + "Thank you,\n"
    + "Exartu team";
};


// Endpoints
Router.map(function () {
  this.route('emailVerification', {
    where: 'server',
    path: '/emailVerification/:token',
    action: function () {
      var token = this.params.token;
      var user = Meteor.users.findOne({'emails.token': token});

      if(!user ) {
        this.response.writeHead(301,
          {
            Location: Meteor.absoluteUrl('notfound')
          }
        );
        this.response.end();
        return;
      }

      Meteor.users.update({'emails.token': token},
        {
          $pop: {
            emails: -1
          }
        }
      );

      Meteor.users.update({'emails.token': token},
        {
          $set: {
            'emails.$.verified': true,
            'emails.$.token': null
          }
        }
      );

      this.response.writeHead(301,
        {
          Location: Meteor.absoluteUrl()
        }
      );
      this.response.end();
    }
  });
});

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
        // Redirect the user to the invitation verification in order for the user to log in first
        this.response.writeHead(301,{
          Location: Meteor.absoluteUrl('invitationVerification/' + token)
        });
        this.response.end();
      }
    }
  });
});