JobsController = RouteController.extend({
	template: 'jobs',
	layoutTemplate: 'mainLayout'
});

Template.jobs.rendered = function () {
	var viewModel = function () {
		var self = this;
		self.entities = ko.meteor.find(Jobs, {});

		self.jobTypes = ko.observableArray();
		self.ready = ko.observable(false);

		Meteor.call('getJobTypes', function (err, result) {
			if (!err) {
				self.jobTypes(result);
				_.extend(self, helper.createObjTypefilter([], result,
						function () {
							self.entities(ko.mapping.fromJS(Jobs.find(this.query).fetch())());
						})

				);

				self.ready(true);
			}
		});
	};
	helper.applyBindings(viewModel, 'jobsVM');
};