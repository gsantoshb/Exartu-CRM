JobController = RouteController.extend({
    layoutTemplate: 'job',
    action: function () {},
    data: function () {
        Session.set('entityId', this.params._id); // save current contactable to later use on templates
    }
});

Template.job.viewModel = function () {
    var self = this,
        jobId = Session.get('entityId');

    self.job = ko.meteor.findOne(Jobs, {
        _id: jobId
    });

    return self;
};