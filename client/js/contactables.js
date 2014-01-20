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


		var search = function () {
			var q = {
				$or: []
			};
			_.each(self.filter(), function (elem) {
				if (elem.check()) {
					var aux = {}
					aux[elem.label] = {
						$exists: true
					};
					q.$or.push(aux);
				}
			})
			console.dir(q);
			if (q.$or.length == 0)
				q = {};

			self.entities(ko.mapping.fromJS(Contactables.find(q).fetch())());
		};

		self.filter = ko.observableArray();
		self.contactableTypes = ko.observableArray();
		Meteor.call('getContactableTypes', function (err, result) {
			if (!err) {
				self.contactableTypes(result);
				self.filter(
					_.map(result, function (type) {
						filter = {
							check: ko.observable(true),
							label: type.name,
							typeId: type._id
						};
						filter.check.subscribe(search);

						return filter;
					})
				);

				//debugger;
			}
		});

		self.showAddContactableModal = function (typeId) {
			Session.set('newContactableTypeId', typeId);
			$('#addContactableModal').modal('show');
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