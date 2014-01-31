Template.addUser.viewmodel = function () {
	var self = this;

	var newUser = {
		username: ko.observable('').extend({
			required: true
		}),
		email: ko.observable('').extend({
			required: true
		}),
		password: ko.observable('').extend({
			required: true
		}),
		roles: ko.observableArray([]).extend({
			required: true
		})
	};
	self.newUserValidate = ko.validatedObservable(newUser);

	self.roles = [];
	_.forEach(Enums.systemRoles, function (rol) {
		self.roles.push(rol);
	});

	self.addUser = function () {
		if (!self.newUserValidate.isValid())
			self.newUserValidate.errors.showAllMessages();

		Meteor.call('addHierUser', ko.toJS(self.newUserValidate), function () {
			$('#addUserModal').modal('hide');
		});
	};

	return self;
}