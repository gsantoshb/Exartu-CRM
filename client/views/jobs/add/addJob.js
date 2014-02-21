Template.addJob.viewModel = function (objname) {
    var options = {
        self: this,
        extendEntity: function (self) {

            _.extend(self.entity(), new koJob());
            self.industries = LookUps.findOne({
                name: 'jobIndustry'
            }, {
                _id: 0,
                items: 1
            }).items;
            self.categories = LookUps.findOne({
                name: 'jobCategory'
            }, {
                _id: 0,
                items: 1
            }).items;
            self.statuses = LookUps.findOne({
                name: 'jobStatus'
            }, {
                _id: 0,
                items: 1
            }).items;
            self.durations = LookUps.findOne({
                name: 'jobDuration'
            }, {
                _id: 0,
                items: 1
            }).items;
            return self;
        },
        objname: objname,
        addCallback: function (job) {
            Meteor.call('addJob', ko.toJS(job));
            $('#addJobModal').modal('hide');
        }
    }

    helper.addExtend(options);

    return this;
}

Meteor.methods({
    addJob: function (job) {
        job.hierId = Meteor.user().hierId;
        Jobs.insert(job);
    }
});