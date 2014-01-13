ContactablesController = RouteController.extend({
    template: 'contactables',
    layoutTemplate: 'mainLayout',
});

var contactablesHandle = Meteor.subscribe('contactables');

Template.contactables.rendered = function () {
    var viewModel = function () {
        var self = this;
        self.addVM = addVM();
        self.filter = ko.observable({});
        self.entities = ko.meteor.find(Contactables, {});
        self.filter = ko.observableArray([{
            check: ko.observable(true),
            label: 'isEmployee'
        }, {
            check: ko.observable(true),
            label: 'isContact'
        }, {
            check: ko.observable(true),
            label: 'isCustomer'
        }]);
        var search = function () {
            var q = {
                $or: []
            };
            _.each(self.filter(), function (elem) {
                if (elem.check()) {
                    var aux = {}
                    aux[elem.label] = elem.check();
                    q.$or.push(aux);
                }
            })
            console.dir(q);
            self.entities(ko.mapping.fromJS(Contactables.find(q).fetch())());
        };
        _.forEach(self.filter(), function (prop) {
            prop.check.subscribe(search);
        })
    };

    ko.applyBindings(new viewModel());
};

var addVM = function () {
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

    return new viewModel();
};