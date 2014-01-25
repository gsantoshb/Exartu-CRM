Template.addJob.viewmodel = function (typeId) {
	var self = this;

	self.objTypeName = ko.observable('');
	self.ready = ko.observable(false);

	Meteor.call('getObjType', typeId, function (err, result) {
		if (!err) {
			_.forEach(result.fields, function (item) {
				_.extend(item, {
					value: ko.observable().extend({
						pattern: {
							message: 'error',
							params: item.regex
						}
					})
				})
			});
			self.objTypeName(result.name);
			var aux = {
				type: ko.observableArray([typeId]),
			}
			aux[result.name] = ko.observableArray(result.fields)
			self.job = ko.validatedObservable(aux);

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

	self.addJob = function () {
		if (!self.job.isValid()) {
			self.job.errors.showAllMessages();
			return;
		};
		var relNames = _.map(self.relations(), function (r) {
			return r.relation.name;
		});
		var relValues = _.map(self.relations(), function (r) {
			if (r.value()) return r.value()._id();
		});
		_.extend(self.job(), _.object(relNames, relValues));

		var fields = self.job()[self.objTypeName()]();
		delete self.job()[self.objTypeName()];
		self.job()[self.objTypeName()] = {};
		_.forEach(fields, function (field) {
			self.job()[self.objTypeName()][field.name] = field.value() || field.defaultValue;
		})

		Meteor.call('addJob', ko.toJS(self.job));
		$('#addJobModal').modal('hide');
	}
	return this;
}

Meteor.methods({
	addJob: function (job) {
		Jobs.insert(job);
	},
});