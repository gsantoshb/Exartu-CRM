Template.addContactable.viewmodel = function (typeId) {
    var self = this;
    var myPerson = new koPerson();
    var myOrg = new koOrganization();

    self.ready = ko.observable(false);

    self.hasError = function (data) {
        return data.isModified() && !data.isValid();
    }

    self.types = ko.observableArray(['person', 'org']);
    self.selectedType = ko.observable('person');
    self.selectedType.subscribe(function (newVal) {
        switch (newVal) {
        case 'person':
            _.extend(self.contactable(), {
                person: myPerson,
            });
            if (self.contactable().organization) {
                self.contactable().organization = null;
            }
            break;
        case 'org':
            _.extend(self.contactable(), {
                organization: myOrg
            });
            if (self.contactable().person) {
                self.contactable().person = null;
            }
            break;

        }
    });

    Meteor.call('getFields', typeId, function (err, result) {
        if (!err) {
            _.forEach(result, function (item) {
                return _.extend(item, {
                    value: ko.observable().extend({
                        pattern: {
                            message: 'error',
                            params: item.regex,
                        }
                    })
                })
            });
            self.contactable = ko.validatedObservable({
                type: ko.observableArray([typeId]),
                person: myPerson,
                organization: null,
                EmployeeFields: ko.observableArray(result)
            });

            self.ready(true);
        }
    });

    self.addContactable = function () {
        //        debugger;
        if (!self.contactable.isValid()) {
            self.contactable.errors.showAllMessages();
            return;
        }
        //        var names = _.map(self.contactable.EmployeeFields, function (item) {
        //            return item.name;
        //        });
        //        var values = _.map(self.fields(), function (item) {
        //            return item.value();
        //        })
        //        var employee = _.object(names, values);
        //        _.extend(self.contactable, {
        //            Employee: employee
        //        });
        //
        //        Meteor.call('addContactable', self.contactable);
        $('#addContactableModal').modal('hide');
        //debugger;
    }
    return this;
}

Meteor.methods({
    addContactable: function (contactable) {
        Contactables.insert(contactable);
    },
    getFields: function (id) {

    },
    getContactablesType: function () {

    }
});