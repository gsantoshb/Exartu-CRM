Template.addJob.viewModel = function (objname) {
    var self = this;
    var options = {
        self: self,
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
            self.canAdd = ko.observable(true);
            return self;
        },
        objname: objname,
        addCallback: function (job) {
            self.canAdd(false);
            Meteor.call('addJob', ko.toJS(job), function (err, result) {
                self.canAdd(true);
                if (err)
                    console.log(err);
                else
                    $('#addJobModal').modal('hide');
            });
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