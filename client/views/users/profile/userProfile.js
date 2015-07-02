UserProfileController = RouteController.extend({
    template: 'userProfile',
    action: function () {
        userId.set(this.params.userId || Meteor.userId());

        if (!this.ready()) {
            debugger;
            this.render('loadingContactable');
        }
        else
            this.render();
    },
    onAfterAction: function () {
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
var user;
var userId = new ReactiveVar();
var errorMessage = new ReactiveVar('');
var successMessage = new ReactiveVar('');

Template.userProfile.created = function () {
    user = Meteor.users.findOne(userId.get());
    if (!user){
        Router.go('/notfound');
    }
};
var pendingEmail;

Template.userProfile.helpers({
    getUserInfoSchema: function () {
        return EditUserInfoSchema;
    },
    getPasswordSchema: function () {
        return ChangeUserPasswordSchema;
    },
    canEdit: function () {
        return userId.get() == Meteor.userId();
    },
    getData: function () {
        var u = Meteor.users.findOne(userId.get());
        return {
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.emails[0].address
        }
    },
    userId: function () {
        return userId.get();
    },

    changePassword: function () {
        return changePassword;
    },
    userPicture: function () {
        var u = Meteor.users.findOne(userId.get());
        if (u.profilePictureId) {
            return UsersFS.getUrlForBlaze(u.profilePictureId)
        }
        if (u.services && u.services.google && u.services.google.picture) {
            return u.services.google.picture;
        }
        return '/assets/user-photo-placeholder.jpg';
    },
    isPasswordUser: function () {
        var u = Meteor.users.findOne(userId.get());
        return _.isObject(u.services.email);
    },
    isGoogleUser: function () {
        var u = Meteor.users.findOne(userId.get());
        return _.isObject(u.services.google);
    },
    pendingEmail: function () {
        var u = Meteor.users.findOne(userId.get());
        _.any(u.emails, function (email) {
            if (email.token) {
                pendingEmail = email.address;
                return true;
            }
            return false;
        });

        return pendingEmail;
    },
    errorMessage: function () {
        return errorMessage.get();
    },
    successMessage: function () {
        return successMessage.get();
    }
});

Template.userProfile.events({
    'click #edit-pic': function () {
        $('#edit-picture').trigger('click');
    },
    'change #edit-picture': function (e) {
        var fsFile = new FS.File(e.target.files[0]);

        fsFile.metadata = {
            owner: user._id
        };

        var file = UsersFS.insert(fsFile);

        Meteor.call('updateUserPicture', file._id);
    },
    'click #edit-pic-google': function () {
        Meteor.call('updateUserPicture', null);
    },
    'click #resendEmailVerification': function () {
        if (!pendingEmail)
            return;

        Meteor.call('updateEmailVerification', pendingEmail);
    }
});

AutoForm.hooks({
    'editUserInfo': {
        onSubmit: function (insertDoc, updateDoc, currentDoc) {
            var self = this;
            _.each(['lastName', 'firstName'], function (key) {
                if (insertDoc[key] === undefined){
                    insertDoc[key] = '';
                }
            });

            Meteor.call('updateUserInfo', insertDoc, function (err, result) {
                err && console.log(err);
                self.done(err);
            });

            return false;
        }
    }
});

AutoForm.hooks({
    'changeUserPassword': {
        onSubmit: function (insertDoc, updateDoc, currentDoc) {
            var self = this;
            Accounts.changePassword(insertDoc.oldPassword, insertDoc.newPassword, function (err) {
                if (err){
                    console.log(err);
                    errorMessage.set(err.message);
                }
                self.done(err);
            });

            return false;
        }
    }
});