Accounts.validateLoginAttempt(function(attempt) {
  //console.log('login attempt',attempt);
  if (!attempt.allowed)
    return false;
  if (attempt.user.inactive) return false;
  // users from applicantCenter
  if (attempt.user.origin){
    throw new Meteor.Error(403, 'User not found');
  }

  if (attempt.type == 'password' && !attempt.user.emails[0].verified)
    throw new Meteor.Error(500, 'Email not verified');
  return true;
});

Accounts.validateNewUser(function(user) {
//    if (user.services.google)
//    {
//        var oldUser = Meteor.users.findOne({
//            'emails.address': user.services.google.email
//        });
//        if (oldUser)
//            throw new Meteor.Error(403, user.services.google.email + " email is already in use");
//    }

    return true;
});

Accounts.onCreateUser(function (options, user) {
  var hierId = '';
  var userEmail = options.email;
  var roles = options.roles;
  console.log('on create user');
  // console.dir(user);
  // console.dir(options);
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
    _.forEach(Roles.find().fetch(), function (role) {
      userRoles.push(role.name);
      userPermissions = userPermissions.concat(role.rolePermissions);
    });
    roles = userRoles;
    user.permissions = _.uniq(userPermissions);
    hierId = Meteor.call('createHier', {
      name: userEmail.split('@')[0]
    });

    //send email to sales
    sendEmailToSales(user);

    user._id = Meteor.uuid();

    // Demo data
    // Seed database with all kind of data to make a demo faster and easier
    // This seed is applied only if meteor server is executed with  Meteor.settings.demo on TRUE
    if (Meteor.settings.demo)
    {
      _.forEach(demoSeed, function (seedFn) {
        seedFn.apply(this, [hierId, user.username, user._id]);
      });
    }
  } else
    hierId = options.profile.hierId;
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

/*
 * extending the user data that is sent to the client
 */
Meteor.publish(null, function () {
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return;

  return Meteor.users.find({
    hierId: user.hierId
  }, {
    fields: {
      'username': 1,
      'emails': 1,
      'services.google.picture': 1,
      'services.email': 1,
      'profilePictureId': 1,
      "hierId": 1,
      "createdAt": 1,
      "roles": 1,
      "permissions": 1,
      "lastCustomerUsed": 1,
      "inactive":1
    }
  });
});

// Publish user invitations
Meteor.publish('userInvitations', function() {
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return;

  return UserInvitations.find({hierId: user.hierId}, {fields: {email: 1, sentBy: 1, createdAt: 1, used: 1}});
});

Meteor.users.allow({
  update: function (userId, file, fields, modifier) {
    var user = Meteor.users.findOne({
      _id: userId
    });

    if (userId == file._id)
      return true;

    if (file.hierId != user.hierId)
      return false;
    if (!_.contains(user.roles, Enums.roleFunction.System_Administrator))
      return false;
    if (_.any(['dateCreated', 'hierId', 'services'], function (field) {
      return _.contains(fields, field);
    }))
      return false;
    return true;
  }
});
Meteor.publish("users", function () {
  var user = Meteor.users.findOne({
    _id: this.userId
  });
  return Meteor.users.find({
    hierId: user.hierId
  });
});

var getPermissions = function (user) {
  var userPermissions = [];
  _.forEach(user.roles, function (role) {
    var dbrole = Roles.findOne({
      name: role
    });
    userPermissions = _.uniq(userPermissions.concat(dbrole.rolePermissions));
  });
  return userPermissions;
}

Meteor.methods({
  userRoleRemove: function (role, user) {
    if (!user || !user.roles) return;
    var index = user.roles.indexOf(role);
    if (index > -1) {
      user.roles.splice(index, 1);
    }
    ;
    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        roles: user.roles,
        permissions: getPermissions(user)
      }
    });
  },
  resendUserVerificationEmail: function(userId) {
    var user = Meteor.users.findOne(userId);
    if (!user)
      throw new Meteor.Error(500, 'User not found');

    var address = (user.emails[0] || {}).address;
    if (!address)
      throw new Meteor.Error(500, 'Not email avialable');

    Accounts.sendVerificationEmail(userId, address);
  },
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

    console.dir(info);
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
    var shortId = Meteor.require('shortid');
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

    Meteor.call('sendEmail', email ,'TempWorks - Email verification', html, true);
  },
  setLastCustomerUsed: function(id){
    if (! Contactables.findOne({_id: id, Customer: {$exists: true}})){
      throw new Meteor.Error(400,'Customer Not found')
    }
    Meteor.users.update({ _id: Meteor.userId() },{ $set: {lastCustomerUsed: id} });
  }
});

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

// Users files
UsersFS = new Document.Collection({
  collection: Meteor.users
});
UsersFS.publish(); // Default publish and allow options

//UsersFS.allow({
//  insert: function (userId, file) {
//    return true;
//  },
//  update: function (userId, file, fields, modifier) {
//    return true;
//  },
//  remove: function (userId, file) {
//    return false;
//  }
//});
//
//  default: function (options) {
//    console.dir('user default handler');
//    console.dir(options);
//    return {
//      blob: options.blob,
//      fileRecord: options.fileRecord
//    };
//  }

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
}
