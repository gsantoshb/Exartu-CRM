Template.contactMethods.viewModel = function () {
    var self = this;

    self.errorMessage = ko.observable("");
    self.addStep = ko.observable(0);
    self.nextStep = function () {
        self.addStep(self.addStep() + 1);
    }

    self.contactable = ko.meteor.findOne(Contactables, {
        _id: Session.get('entityId')
    });

    if (!self.contactable()) {

        console.log('contactable is undefined', Session.get('entityId'));
    }
    if (!self.contactable().contactMethods) {
        self.contactable().contactMethods = ko.observable([]);
    }

    self.newContactMethod = {
        type: ko.observable(''),
        value: ko.observable('')
    }
    self.add = function () {
        Contactables.update({
            _id: Session.get('entityId')
        }, {
            $addToSet: {
                contactMethods: ko.toJS(self.newContactMethod)
            }
        });
        self.newContactMethod.type('');
        self.newContactMethod.value('');
        self.addStep(0);
    }

    return self;
}