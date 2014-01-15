ContactablesController = RouteController.extend({
    template: 'contactables',
    layoutTemplate: 'mainLayout',
});

Template.contactables.rendered = function () {
    var viewModel = function () {
        var self = this;
        self.filter = ko.observable({});
        self.entities = ko.meteor.find(Contactables, {});
        self.searchString = ko.observable('');
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
        self.searchString.subscribe(function (value) {
            self.entities(ko.mapping.fromJS(Contactables.find({
                '$or': [{
                    'firstName': {
                        $regex: value
                    }
                            }, {
                    'lastName': {
                        $regex: value
                    }
                        }, {
                    'organizationName': {
                        $regex: value
                    }
                        }, {
                    'tags': {
                        $regex: value
                    }
                        }]
            }).fetch())());
        });
    };
    helper.applyBindings(viewModel, 'contactablesVM');
};