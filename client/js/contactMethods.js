Template.contactMethods.rendered = function () {
    var vm = function () {
        var self = this;

        self.contactable = ko.meteor.findOne(Contactables, {
            _id: Session.get('entityId')
        });
        if (!self.contactable()) {
            console.log('contactable is undefined');
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
        }
    }
    ContactableHandler.wait(function () {
        ko.applyBindings(new vm(), document.getElementsByName('contactMethodVM')[0]);
    });
}