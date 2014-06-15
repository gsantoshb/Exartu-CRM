UsersController = RouteController.extend({
    template: 'users',
    layoutTemplate: 'usersLayout'
});

Template.users.viewModel = function () {
    var self = this;

    self.users = ko.meteor.find(Meteor.users, {});
    self.removeGroup = function (role, user) {
        {
            var usr = ko.toJS(user);
            Meteor.users.update({
                _id: usr._id
            }, {
                $pull: {
                    roles: role
                }
            });
            Meteor.call('getHierUsers', function (err, result) {
                self.users(result);
            });
        }
    };
    Meteor.call('getHierUsers', function (err, result) {
        self.users(result);
    });

    return self;
};