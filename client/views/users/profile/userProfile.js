UserProfileController = RouteController.extend({
    layoutTemplate: 'userProfile',
});

Template.userProfile.viewModel = function () {
    var self = {},
        userId = Router.current().params._id;

    if (!userId)
        userId = Meteor.userId();
    self.user = ko.meteor.findOne(Meteor.users, {
        _id: userId
    });
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

    }

    return self;
}