Template.addJob.viewmodel = function (objname) {
    var options = {
        self: this,
        extendEntity: function (self) {
            _.extend(self.entity(), new koJob());

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