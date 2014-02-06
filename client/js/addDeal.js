Template.addDeal.viewmodel = function (objname) {
	var self = this;

	var objType = ObjTypes.findOne({
		objName: objname
	});
    var aux = {
		objNameArray: ko.observableArray([objType.objName])
    };
    self.deal = ko.validatedObservable(aux);
    self.objTypeName = ko.observable(objType.objName);
	self.ready = ko.observable(false);


	_.forEach(objType.fields, function (item) {
		_.extend(item, {
			value: ko.observable().extend({
				pattern: {
					message: 'invalid value',
					params: item.regex
				}
			})
		});
		if (item.fieldType == Enums.fieldType.lookUp) {
			_.extend(item, {
                value: item.multiple ? ko.observableArray(item.defaultValue) : ko.observable(item.defaultValue),
				options: LookUps.findOne({
					name: item.lookUpName
				}).items,
			})
		}
	});
	aux[objType.objName] = ko.observableArray(objType.fields)

	self.relations = ko.observableArray([]);
	Meteor.call('getShowInAddRelations', objType.objName, function (err, result) {
        console.log('show in relations - deal');
		_.each(result, function (r) {
			self.relations.push({
				relation: r,
				data: ko.meteor.find(window[r.target.collection], r.target.query),
				value: ko.observable(null)
			});
		})

		self.ready(true);
	});

	self.addDeal = function () {
		if (!self.deal.isValid()) {
			self.deal.errors.showAllMessages();
			return;
		};
		var relNames = _.map(self.relations(), function (r) {
			return r.relation.name;
		});
		var relValues = _.map(self.relations(), function (r) {
			if (r.value()) return r.value()._id();
		});
		_.extend(self.deal(), _.object(relNames, relValues));

		var fields = self.deal()[self.objTypeName()]();
		delete self.deal()[self.objTypeName()];
		self.deal()[self.objTypeName()] = {};
		_.forEach(fields, function (field) {
            self.deal()[self.objTypeName()][field.name] = field.value() == null ? field.defaultValue : field.value();
        });
		Meteor.call('addDeal', ko.toJS(self.deal), function (err, result) {
			console.log(err);
		});
		$('#addDealModal').modal('hide');
	}
	return this;
}

Meteor.methods({
	addDeal: function (deal) {
		deal.hierId = Meteor.user().hierId;
		Deals.insert(deal);
	}
});