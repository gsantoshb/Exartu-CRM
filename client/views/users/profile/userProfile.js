UserProfileController = RouteController.extend({
  layoutTemplate: 'userProfile',
});
Template.userProfile.waitOn = ['UsersHandler'];

Template.userProfile.viewModel = function () {
  var self = {},
    userId = Router.current().params._id;

  self.filesCollection = UsersFS;

  if (!userId)
    userId = Meteor.userId();
  self.user = ko.meteor.findOne(Meteor.users, {
    _id: userId
  });
  if (!self.user()) debugger;
  self.editUser = {
    username: ko.validatedObservable(self.user().username()).extend({
      required: true,
      uniqueUserInformation: {
        params: {
          field: 'username'
        },
        message: 'Username is already in use'
      }
    }),
    email: ko.observable(self.user().emails()[0].address()).extend({
      required: true,
      uniqueUserInformation: {
        params: {
          field: 'emails.address'
        },
        message: 'Email is already in use by another account'
      }
    })
  }
  self.getProfileImage = function (user) {
    if (!user)
      return defaultImage;
    if (user.services) {
      if (user.services.google) {
        return user.services.google.picture;
      }
    }
  }
  self.save = function () {
    var user = ko.toJS(self.editUser);
    user.emails = [
      {
        address: user.email,
        verified: false
      }
    ]
    delete user.email;
    Meteor.users.update({
      _id: userId
    }, {
      $set: user
    });
  }

  var googlePicture = undefined;
  if (self.user().services && self.user().services.google)
    googlePicture = ko.observable({
      ready: ko.observable(true),
      picture: self.user().services.google.picture
    });

  self.userPicture = self.user().profilePictureId? UsersFS.getUrl(self.user().profilePictureId()) : googlePicture;
  self.pictureUrl = ko.computed(function() {
    if (!self.userPicture || !self.userPicture().ready())
      return undefined;
    return self.userPicture().picture();
  });

  self.editPicture = function () {
    $('#edit-picture').trigger('click');
  }

  $('#edit-picture').change(function (e) {
    var fsFile = new FS.File(e.target.files[0]);
    fsFile.metadata = {
      entityId: userId,
      owner: Meteor.userId(),
      name: fsFile.name
    };
    var file = UsersFS.insert(fsFile);
    UsersFS.getUrl(file._id, self.userPicture);
    Meteor.call('updateUserPicture', file._id);
  });

  return self;
}