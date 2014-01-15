Template.addContactableModal.rendered = function () {
    var viewModel = function () {
        var self = this;
        self.firstName = ko.observable('');
        self.lastName = ko.observable('');
        self.organizationName = ko.observable('');
        self.department = ko.observable('');
        self.statusNote = ko.observable('');
        self.isEmployee = ko.observable(true);
        self.isContact = ko.observable(false);
        self.isCustomer = ko.observable(false);
        self.person = ko.computed(function () {
            return self.isEmployee() || self.isContact();
        });
        self.organization = ko.computed(function () {
            return self.isCustomer();
        });
        self.addContactable = function () {
            var newContactable = {
                isEmployee: self.isEmployee(),
                isContact: self.isContact(),
                isCustomer: self.isCustomer(),
                statusNote: self.statusNote(),
            }
            if (!newContactable.isContact && !newContactable.isCustomer && !newContactable.isEmployee) reuturn;

            if (newContactable.isContact || newContactable.isEmployee) {
                newContactable.firstName = self.firstName();
                newContactable.lastName = self.lastName();
            }
            if (newContactable.isCustomer) {
                newContactable.organizationName = self.organizationName();
                newContactable.department = self.department();
            }
            Meteor.call('addContactable', newContactable);
            $('#addContactableModal').modal('hide');
        }
        return this;
    }
    helper.applyBindings(viewModel, 'addVontactableVM');
};

Meteor.methods({
    addContactable: function (contactable) {
        Contactables.insert(contactable);
    }
});