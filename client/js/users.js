UsersController = RouteController.extend({
	template: 'users',
	layoutTemplate: 'usersLayout'
});
UsersVM = function () {
    var self = this;
    self.users = ko.meteor.find(Meteor.users, {});
    self.removeGroup=function(data)
    {
        if (confirm("Remove group: " + data + "?"))
        {

        }
    };
    Meteor.call('getHierUsers', function (err, result) {
        self.users(result);
    });
}
Template.users.rendered = function () {
	helper.applyBindings(UsersVM, 'usersVM');
};