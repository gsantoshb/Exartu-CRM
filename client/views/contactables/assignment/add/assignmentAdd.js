Template.contactableAssignmentAdd.viewModel = function (contactableId) {
    var self = this;

    self.jobs = ko.meteor.find(Jobs, {});
    // Add job's customer display name on job display name
    _.forEach(self.jobs(), function (job) {
        if (job.CustomerInfo && job.CustomerInfo.displayName)
            job.displayName = job.displayName() + ' at ' + job.CustomerInfo.displayName();
    });

    self.job = ko.observable();
    self.add = function () {
        if (!self.job())
            return;

        Jobs.update({
            _id: self.job()
        }, {
            $set: {
                assignment: contactableId
            }
        }, function (err, result) {
            if (!err)
                Contactables.update({
                    _id: contactableId
                }, {
                    $set: {
                        assignment: self.job()
                    }
                })
        });
        self.close();
    }
    return self;
}