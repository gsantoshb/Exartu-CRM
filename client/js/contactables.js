ContactablesController = RouteController.extend({
    template: 'contactables',
    layoutTemplate: 'mainLayout',
});

var contactablesHandle = Meteor.subscribe('contactables');

Template.contactables.rendered = function () {
    var viewModel = function () {
        var self = this;
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

    ko.applyBindings(new viewModel(), document.getElementsByName('contactablesVM')[0]);
};