UsersController = RouteController.extend({
    template: 'users',
    layoutTemplate: 'usersLayout'
});

Template.users.viewModel = function () {
    var self = this;

    self.users = ko.meteor.find(Meteor.users, {});
    self.removeGroup = function (role, user) {
        {
            Meteor.call('userRoleRemove', role, user, function (err, result) {
                self.users(result);
            });
        }
    };
    Meteor.call('getHierUsers', function (err, result) {
        self.users(result);
    });

    return self;
};