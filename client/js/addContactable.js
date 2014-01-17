Template.addEmployee.rendered = function () {
    var viewModel = function () {
        var contactable = {
            type: [0],
            contactMethods: [],
        };
        var person = {
            firstName: '',
            lastName: '',
            lmiddleName: '',
            salutation: '',
            jobTitle: '',
            salutation: '',
        };
        var organization = {
            organizationName: '',
        };
        _.extend(contactable, {
            person: person
        });

        var self = this;

        self.fields = ko.observableArray();
        Meteor.call('getFields', 0, function (err, result) {
            if (!err) {
                self.fields(result);

                var names = _.map(result, function (item) {
                    return item.name;
                });
                var values = _.map(result, function (item) {
                    return item.defaultValue;
                })
                var employee = _.object(names, values);
                _.extend(contactable, {
                    employee: employee
                });
                debugger;
            }
        });
        self.fieldVM = function (field) {
            switch (field.type) {
            case 0:
                return 'inStringField';
            case 1:
                return 'asd';
            }
        };

        self.organizationName = ko.observable('');
        self.department = ko.observable('');

        self.statusNote = ko.observable('');

        self.isEmployee = ko.observable(false);
        self.isContact = ko.observable(false);
        self.isCustomer = ko.observable(true);

        self.addContactable = function () {
            Meteor.call('addContactable', ko.toJS(self.contactable));
            $('#addContactableModal').modal('hide');
        }
        return this;
    }
    helper.applyBindings(viewModel, 'addEmployeeVM');
};


//Template.addPerson.rendered = function () {
//    var viewModel = function () {
//        var self = this;
//        self.firstName = ko.observable('');
//        self.lastName = ko.observable('');
//        self.statusNote = ko.observable('');
//        self.isEmployee = ko.observable(true);
//        self.isContact = ko.observable(false);
//        self.isCustomer = ko.observable(false);
//
//        self.addContactable = function () {
//            var newContactable = {
//                isEmployee: self.isEmployee(),
//                isContact: self.isContact(),
//                isCustomer: self.isCustomer(),
//                statusNote: self.statusNote(),
//            }
//            if (!newContactable.isContact && !newContactable.isCustomer && !newContactable.isEmployee) reuturn;
//
//            if (newContactable.isContact || newContactable.isEmployee) {
//                newContactable.firstName = self.firstName();
//                newContactable.lastName = self.lastName();
//            }
//            if (newContactable.isCustomer) {
//                newContactable.organizationName = self.organizationName();
//                newContactable.department = self.department();
//            }
//            Meteor.call('addContactable', newContactable);
//            $('#addContactableModal').modal('hide');
//        }
//        return this;
//    }
//    helper.applyBindings(viewModel, 'addPersonVM');
//};
Meteor.methods({
    addContactable: function (contactable) {
        Contactables.insert(contactable);
    },
    getFields: function (id) {

    }
});