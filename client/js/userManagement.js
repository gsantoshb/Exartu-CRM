UserManagementController = RouteController.extend({
	template: 'userManagement',
	layoutTemplate: 'managementLayout'
});

Template.userManagement.rendered = function () {
	var viewModel = function () {
		var self = this;

		self.users = ko.meteor.find(Meteor.users, {});

		Meteor.call('getHierUsers', function (err, result) {
			self.users(result);
		})
	};

	helper.applyBindings(viewModel, 'userManagementVM');
};