ContactablesController = RouteController.extend({
	template: 'contactables',
	layoutTemplate: 'mainLayout'
});

Template.contactables.rendered = function () {
	var viewModel = function () {
		var self = this;
        self.ready = ko.observable(false);
		self.entities = ko.meteor.find(Contactables, {});
        self.contactableTypes = ko.observableArray();
        self.ready = ko.observable(false);
        self.getIconForObjName = function (objName) {
            switch (objName) {
                case ('Employee'):
                    return 'glyphicon glyphicon-user';
                case ('Customer'):
                    return 'glyphicon glyphicon-credit-card';
                case ('Job'):
                    return 'glyphicon glyphicon-book';
                default:
                    return 'glyphicon glyphicon-question-sign';
            };
        };
        Meteor.call('getContactableTypes', function (err, result) {
            if (!err) {
                self.contactableTypes(result);
                console.log('result',result);
                _.extend(self, helper.createObjTypefilter(['person.firstName', 'person.lastName', 'organization.organizationName'], result,
                    function () {
                        console.log('filter',filter);
                        self.entities(ko.mapping.fromJS(Contactables.find(this.query).fetch())());
                        console.log('hello');
                    })

                );

                self.ready(true);
            }
        });


		self.showAddContactableModal = function (typeId) {
			Session.set('newContactableTypeId', typeId);
			$('#addContactableModal').modal('show');
		};
	};
	helper.applyBindings(viewModel, 'contactablesVM');
};