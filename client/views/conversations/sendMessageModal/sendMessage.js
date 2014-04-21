Template.sendMessage.viewModel = function (contactable) {
    var contactableId = _.isObject(contactable) ? contactable._id() : contactable;
    var thisModal = this.modal;
    var self = this;
    var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    self.email = ko.validatedObservable({
        to: ko.observable().extend({
            required: true,
            pattern: {
                message: 'invalid mail',
                params: emailRE
            }
        }),
        subject: ko.observable(),
        text: ko.observable().extend({
            required: true
        }),
    })

    self.methods = ko.observableArray(['email']);
    self.selectedMethod = ko.observable();


    self.contactable = ko.meteor.findOne(Contactables, {
        _id: contactableId
    });

    self.contactMethodName = ko.observable('email');
    self.showContactMethodName = ko.observable(false);
    self.selectedAdress = ko.observable();

    var oldValueOfTo = null;

    self.selectedAdress.subscribe(function (value) {
        if (value) {
            oldValueOfTo = self.email().to();
            self.email().to(value);
        } else {
            self.email().to(oldValueOfTo);
        }
    })
    self.existsInContactMethods = ko.computed(function () {
        if (!self.contactable().contactMethods())
            return false;
        return _.find(self.contactable().contactMethods(), function (item) {
            return item.value() === self.email().to();
        })
    });

    self.addToContactMethods = function () {
        var email = ko.toJS(self.email);
        if (!email.to)
            return;
        if (!self.email().to.isValid())
            return;

        debugger;
        var type = ContactMethods.findOne({type: Enums.contactMethodTypes.email})

        Contactables.update({
            _id: contactableId
        }, {
            $addToSet: {
                'contactMethods': {
                    type: type._id,
                    value: email.to
                }
            }
        });
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

    self.canSend = ko.observable(true);
    self.send = function () {
        var selectedMethod = self.selectedMethod();
        switch (selectedMethod) {
        case 'email':
            if (!self.email.isValid()) {
                self.email.errors.showAllMessages();
                return;
            }
            self.canSend(false);
            var email = ko.toJS(self.email);
            Meteor.call('sendEmail', email.to, email.subject, email.text, function (err, result) {
                self.canSend(true);
                if (!err) {
                    self.close();
                } else {
                    console.error(err);
                }
            });
        }
    }
    return self;
}