Template.addContactable.viewmodel = function (typeId) {
	var self = this;

	self.contactable = {
		type: typeId
	};

	_.extend(self.contactable, {
		person: Global.person
	});

	self.fields = ko.observableArray();
	Meteor.call('getFields', typeId, function (err, result) {
		if (!err) {
			_.forEach(result, function (item) {
				return _.extend(item, {
					value: ko.observable()
				})
			});
			self.fields(result);
			//debugger;
		}
	});

	self.addContactable = function () {
		var names = _.map(self.fields(), function (item) {
			return item.name;
		});
		var values = _.map(self.fields(), function (item) {
			return item.value();
		})
		var employee = _.object(names, values);
		_.extend(self.contactable, {
			employee: employee
		});

		Meteor.call('addContactable', self.contactable);
		$('#addContactableModal').modal('hide');
		debugger;
	}
	return this;
}

Meteor.methods({
	addContactable: function (contactable) {
		Contactables.insert(contactable);
	},
	getFields: function (id) {

	},
	getContactablesType: function () {

	}
});