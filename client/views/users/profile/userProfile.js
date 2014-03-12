UserProfileController = RouteController.extend({
    layoutTemplate: 'userProfile',
});
Template.userProfile.waitOn = ['UsersHandler','UsersFSHandler'];

Template.userProfile.viewModel = function () {
    var self = {},
        userId = Router.current().params._id;

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

    // Contactable picture
    var updatePicture = function () {
        //        debugger;
        if (self.picture() && self.picture().fileHandler.
            default) {
            //            debugger;
            self.pictureUrl(self.picture().fileHandler.
                default.url());
        } else if (!self.picture().fileHandler.
            default) {
            var getUrl = function (retries) {
                if (retries > 0) {
                    setTimeout(function () {
                        if (self.picture().fileHandler.
                            default) {
                            //                            debugger;
                            self.pictureUrl(self.picture().fileHandler.
                                default.url());
                        } else
                            getUrl(retries - 1);
                    }, 1000);
                } else {
                    self.pictureErrorMessage("Error editing picture, try again");
                }
            }
            getUrl(10);
        }
    }

    if (!self.user().profilePictureId)
        self.user().profilePictureId = ko.observable('');

    var queryPicture = ko.computed(function () {
        return {
            _id: self.user().profilePictureId()
        }
    });

    self.picture = ko.meteor.findOne(UsersFS, queryPicture);
    self.picture.subscribe(function () {
        updatePicture();
    });
    self.pictureErrorMessage = ko.observable("");
    self.pictureUrl = ko.observable();
    self.pictureUrl.subscribe(function (value) {
        self.pictureErrorMessage("");
        self.loadPicture(false);
    });
    self.loadPicture = ko.observable(true);

    if (!self.picture()) {
        self.loadPicture(false);
    } else if (self.picture().fileHandler.
        default)
        self.pictureUrl(self.picture().fileHandler.
            default.url());


    self.editPicture = function () {
        $('#edit-picture').trigger('click');
    }

    $('#edit-picture').change(function (e) {
        var fileId = UsersFS.storeFile(e.target.files[0], {
            entityId: userId,
        });

        self.loadPicture(true);

        Meteor.call('updateUserPicture', fileId);
    });


    return self;
}