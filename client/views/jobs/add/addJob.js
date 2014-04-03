Template.addJob.viewModel = function (objname) {
    var self = this;
    var options = {
        self: self,
        extendEntity: function (self) {

            _.extend(self.entity(), new koJob());
            self.industries = LookUps.find({
                codeType: Enums.lookUpTypes.job.industry.code
            }).fetch();
            self.categories = LookUps.find({
                codeType: Enums.lookUpTypes.job.category.code
            }).fetch();
            self.statuses = LookUps.find({
                codeType: Enums.lookUpTypes.job.status.code
            }).fetch();
            self.durations = LookUps.find({
                codeType: Enums.lookUpTypes.job.duration.code
            }).fetch();
            self.canAdd = ko.observable(true);
            self.filter=function(option){
                return option._id;
            }
            return self;
        },
        objname: objname,
        addCallback: function (job) {
            debugger;
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