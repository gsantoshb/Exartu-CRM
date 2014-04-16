Template.addUser.viewModel = function () {
    var self = this;

    var newUser = {
        username: ko.observable('').extend({
            required: true
        }),
        email: ko.observable('').extend({
            required: true,
            pattern: {
                message: 'check this value',
                params: helper.emailRE.str
            }
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
    _.forEach(Roles.find().fetch(), function (rol) {
        self.roles.push(rol.name);
    });

    self.addUser = function () {
        if (!self.newUserValidate.isValid()) {
            self.newUserValidate.errors.showAllMessages();
            return;
        }

        Meteor.call('addHierUser', ko.toJS(self.newUserValidate), function () {
            self.close();
        });
    };

    return self;
}