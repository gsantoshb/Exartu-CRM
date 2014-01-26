Template.addContactable.viewmodel = function (typeId) {
	var self = this;
	var myPerson = new koPerson();
	var myOrg = new koOrganization();

	self.objTypeName = ko.observable('');
	self.ready = ko.observable(false);
	self.types = ko.observableArray(['person', 'org']);
	self.selectedType = ko.observable('person');

	self.selectedType.subscribe(function (newVal) {
		switch (newVal) {
		case 'person':
			_.extend(self.contactable(), {
				person: myPerson
			});
			if (self.contactable().organization) {
				self.contactable().organization = null;
			}
			break;
		case 'org':
			_.extend(self.contactable(), {
				organization: myOrg
			});
			if (self.contactable().person) {
				self.contactable().person = null;
			}
			break;
		}
	});

	Meteor.call('getObjType', typeId, function (err, result) {
		if (!err) {
			_.forEach(result.fields, function (item) {
				_.extend(item, {
					value: ko.observable().extend({
						pattern: {
							message: 'invalid value',
							params: item.regex
						}
					})
				})
			});
			asd = result;
			self.objTypeName(result.objName);
			var aux = {
                objNameArray: ko.observableArray([result.objName]),
				person: myPerson,
				organization: null
			}
			aux[result.objName] = ko.observableArray(result.fields)
			self.contactable = ko.validatedObservable(aux);

			//relations
			self.relations = ko.observableArray([]);
			_.each(result.relations, function (r) {
				if (r.showInAdd)
					self.relations.push({
						relation: r,
						data: ko.meteor.find(window[r.target.collection], r.target.query),
						value: ko.observable(null)
					});
			})

			self.ready(true);
		}
	});

	self.addContactable = function () {
		if (!self.contactable.isValid()) {
			self.contactable.errors.showAllMessages();
			return;
		};
		var relNames = _.map(self.relations(), function (r) {
			return r.relation.name;
		});
		var relValues = _.map(self.relations(), function (r) {
			if (r.value()) return r.value()._id();
		});
		_.extend(self.contactable(), _.object(relNames, relValues));

		var fields = self.contactable()[self.objTypeName()]();
		delete self.contactable()[self.objTypeName()];
		self.contactable()[self.objTypeName()] = {};
		_.forEach(fields, function (field) {
			self.contactable()[self.objTypeName()][field.name] = field.value() || field.defaultValue;
		})
		Meteor.call('addContactable', ko.toJS(self.contactable), function (err, result) {
			console.log(err);
		});
		$('#addContactableModal').modal('hide');
	}
	return this;
}

Meteor.methods({
	addContactable: function (contactable) {
		Contactables.insert(contactable);
	},
	getObjType: function (id) {

	},
	getContactablesType: function () {

	}
});