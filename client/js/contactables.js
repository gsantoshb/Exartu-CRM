ContactablesController = RouteController.extend({
	template: 'contactables',
	layoutTemplate: 'mainLayout'
});

Template.contactables.rendered = function () {
	var viewModel = function () {
		var self = this;
		self.filter = ko.observable({});
		self.entities = ko.meteor.find(Contactables, {});
		self.searchString = ko.observable('');

		self.contactableTypes = ko.observableArray();
		Meteor.call('getContactableTypes', function (err, result) {
			if (!err) {
				self.contactableTypes(result);
				//debugger;
			}
		});

		self.showAddContactableModal = function (typeId) {
			Session.set('newContactableTypeId', typeId);
			$('#addContactableModal').modal('show');
		};

		self.filter = ko.observableArray([{
			check: ko.observable(true),
			label: 'Employees'
        }, {
			check: ko.observable(true),
			label: 'Customer Contacts'
        }, {
			check: ko.observable(true),
			label: 'Customers'
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