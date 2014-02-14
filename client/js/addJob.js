Template.addJob.viewmodel = function (objname) {
    var options = {
        self: this,
        extendEntity: function () {
            return (new koJob())();
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