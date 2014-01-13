Template.contactMethods.rendered = function () {
    var vm = function () {
        var self = this;
        self.contactable = ko.meteor.findOne(Contactables, {
            _id: Session.get('contactableId')
        });
        self.contactMethods = self.contactable().contactMethods || ko.observableArray([]);
        self.newContactMethod = {
            type: ko.observable(''),
            value: ko.observable('')
        }
        self.add = function () {
            Contactables.update({
                _id: Session.get('contactableId')
            }, {
                $addToSet: {
                    contactMethods: ko.toJS(self.newContactMethod)
                }
            });
            self.newContactMethod.type('');
            self.newContactMethod.value('');
        }
    }
    ko.applyBindings(new vm(), document.getElementsByName('contactMethodVM')[0]);
}