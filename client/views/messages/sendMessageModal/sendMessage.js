Template.sendMessage.viewModel = function (contactable) {
    contactable = ko.toJS(contactable);
    var thisModal = this.modal;
    var self = this;
    var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    self.methods = ko.observableArray(['email']);
    self.selectedMethod = ko.observable();
    self.to = ko.observable();
    self.subject = ko.observable();
    self.text = ko.observable();
    self.contactable = ko.meteor.findOne(Contactables, {
        _id: contactable._id
    });
    self.contactMethodName = ko.observable('email');
    self.showContactMethodName = ko.observable(false);
    self.selectedAdress = ko.observable();
    var oldValueOfTo = null;
    self.selectedAdress.subscribe(function (value) {
        if (value) {
            oldValueOfTo = self.to();
            self.to(value);
        } else {
            self.to(oldValueOfTo);
        }
    })
    self.existsInContactMethods = ko.computed(function () {
        if (!contactable.contactMethods)
            return false;
        return _.find(contactable.contactMethods, function (item) {
            return item.value === self.to();
        })
    });

    self.addToContactMethods = function () {
        if (!self.to())
            return;
        if (_.find(contactable.contactMethods, function (item) {
            return item.name === self.contactMethodName();
        })) {
            self.showContactMethodName(true);
            return;
        }

        Contactables.update({
            _id: contactable._id
        }, {
            $addToSet: {
                'contactMethods': {
                    name: self.contactMethodName(),
                    value: self.to()
                }
            }
        });
        self.showContactMethodName(false);
    }
    self.emails = ko.computed(function () {
        if (!self.contactable())
            return [];
        return _.filter(self.contactable().contactMethods(), function (item) {
            return emailRE.test(item.value) != null;
        });
    });

    //    self.selectedMethod.subscribe(function (value) {
    //        switch (value) {
    //        case 'email':
    //            break;
    //        }
    //    });


    self.selectedMethod('email');


    self.send = function () {
        var selectedMethod = self.selectedMethod();
        switch (selectedMethod) {
        case 'email':
            var to = self.to();
            if (to && emailRE.test(to))
                Meteor.call('sendEmail', self.to(), self.subject(), self.text(), function (err, result) {
                    if (!err) {
                        self.close();
                    } else {}
                })
            else
                alert('invalid mail');
            break;
        }
    }
    return self;
}