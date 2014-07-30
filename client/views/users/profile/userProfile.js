UserProfileController = RouteController.extend({
  template: 'userProfile',
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    else
      this.render();
  },
  onAfterAction: function() {
    var title = 'My profile',
      description = '';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

var userInfo = {};
var changePassword = {};

Template.userProfile.created = function() {
  userInfo = Utils.ObjectDefinition({
    reactiveProps: {
      username: {
        default: Meteor.user().username,
        validator: Utils.stringNotEmpty
      },
      email: {
        default: Meteor.user().emails[0].address,
        validator: function() {
          return helper.emailRE.test(this.value);
        },
        errorMessage: 'Incorrect email format'
      },
      errorMessage: {},
      successMessage: {}
    }
  });

  changePassword = Utils.ObjectDefinition({
    reactiveProps: {
      oldPassword: {
        validator: Utils.stringNotEmpty
//        validator: function() {
//          return this.value.length >= 6;
//        },
//        errorMessage: 'Insert a password longer than 5 characters'
      },
      newPassword: {
        validator: Utils.stringNotEmpty
//        validator: function() {
//          return this.value.length >= 6;
//        },
//        errorMessage: 'Insert a password longer than 5 characters'
      },
      errorMessage: {},
      successMessage: {}
    }
  });
};

Template.userProfile.userInfo = function() {
  return userInfo;
};

Template.userProfile.changePassword = function() {
  return changePassword;
};

Template.userProfile.userPicture = function() {
  var user=Meteor.user();
  if (user.profilePictureId){
    return UsersFS.getUrlForBlaze(user.profilePictureId)
  }
  if (user.services && user.services.google && user.services.google.picture){
    return  user.services.google.picture;
  }
  return '/assets/user-photo-placeholder.jpg';
};

Template.userProfile.isPasswordUser = function() {
  return _.isObject(Meteor.user().services.email);
};

Template.userProfile.isGoogleUser = function() {
  return _.isObject(Meteor.user().services.google);
};

var pendingEmail;
Template.userProfile.pendingEmail = function() {
  _.any(Meteor.user().emails, function(email) {
    if(email.token) {
      pendingEmail = email.address;
      return true;
    }
    return false;
  });

  return pendingEmail;
};

Template.userProfile.events({
  'click #edit-pic': function () {
    $('#edit-picture').trigger('click');
  },
  'change #edit-picture': function (e) {
    var fsFile = new FS.File(e.target.files[0]);

    fsFile.metadata = {
      owner: Meteor.userId()
    };

    var file = UsersFS.insert(fsFile);

    Meteor.call('updateUserPicture', file._id);
  },
  'click #save': function() {
    if (!userInfo.isValid()) {
      userInfo.showAllMessages();
      return;
    }

    var upd={};
    if (!_.findWhere(Meteor.user().emails, {address: userInfo.email.value})){
      upd.$addToSet= {
        emails: {
          address: userInfo.email.value,
            verified: false
        }
      };
    }
    upd.$set= {
        username: userInfo.username.value
    };
    Meteor.users.update({_id: Meteor.userId()}, upd, function(err) {
      if (err) {
        userInfo.errorMessage.value = err.reason;
        userInfo.successMessage.value = '';
      }
      else {
        userInfo.errorMessage.value = '';
        if (userInfo.email.value != userInfo.email.default) {
          userInfo.successMessage.value = 'Information saved. Verify your new email';
          Meteor.call('updateEmailVerification', userInfo.email.value);
        }
        else
          userInfo.successMessage.value = 'Information saved';
      }
    });
  },
  'click #changePassword': function() {
    if (!changePassword.isValid()) {
      changePassword.showAllMessages();
      return;
    }

    Accounts.changePassword(changePassword.oldPassword.value, changePassword.newPassword.value, function(err) {
      if (err) {
        changePassword.errorMessage.value = err.reason;
        changePassword.successMessage.value = '';
      }
      else {
        changePassword.errorMessage.value = '';
        changePassword.successMessage.value = 'Password changed';
      }
    });
  },
  'click #edit-pic-google': function() {
    Meteor.call('updateUserPicture', null);
  },
  'click #resendEmailVerification': function() {
    if (!pendingEmail)
      return;

    Meteor.call('updateEmailVerification', pendingEmail);
  }
  }

//Template.userProfile.waitOn = ['UsersHandler'];

//Template.userProfile.viewModel = function () {
//  var self = {},
//    userId = Router.current().params._id;
//
//  self.filesCollection = UsersFS;
//
//  if (!userId)
//    userId = Meteor.userId();
//  self.user = ko.meteor.findOne(Meteor.users, {
//    _id: userId
//  });
//  if (!self.user()) debugger;
//  self.editUser = {
//    username: ko.validatedObservable(self.user().username()).extend({
//      required: true,
//      uniqueUserInformation: {
//        params: {
//          field: 'username'
//        },
//        message: 'Username is already in use'
//      }
//    }),
//    email: ko.observable(self.user().emails()[0].address()).extend({
//      required: true,
//      uniqueUserInformation: {
//        params: {
//          field: 'emails.address'
//        },
//        message: 'Email is already in use by another account'
//      }
//    })
//  }
//  self.getProfileImage = function (user) {
//    if (!user)
//      return defaultImage;
//    if (user.services) {
//      if (user.services.google) {
//        return user.services.google.picture;
//      }
//    }
//  }
//  self.save = function () {
//    var user = ko.toJS(self.editUser);
//    user.emails = [
//      {
//        address: user.email,
//        verified: false
//      }
//    ]
//    delete user.email;
//    Meteor.users.update({
//      _id: userId
//    }, {
//      $set: user
//    });
//  }
//
//  self.userPicture = self.user().profilePictureId ? UsersFS.getUrl(self.user().profilePictureId()) : null;
//
//  self.pictureUrl = ko.computed(function() {
//      if (! self.userPicture)
//      {
//        if (self.user().services && self.user().services.google){
//          return self.user().services.google.picture();
//        }else{
//          return '/assets/user-photo-placeholder.jpg'
//        }
//      }
//
//    if (self.userPicture().ready())
//      return self.userPicture().picture();
//    else
//      return undefined;
//  });
//
//  self.editPicture = function () {
//    $('#edit-picture').trigger('click');
//  }
//
//  $('#edit-picture').change(function (e) {
//    var fsFile = new FS.File(e.target.files[0]);
//    fsFile.metadata = {
//      entityId: userId,
//      owner: Meteor.userId(),
//      name: fsFile.name
//    };
//    var file = UsersFS.insert(fsFile);
//      self.userPicture=UsersFS.getUrl(file._id, self.userPicture);
//    Meteor.call('updateUserPicture', file._id);
//  });
//
//  return self;
//}
//}