Template.assignmentAdd.viewModel = function (jobId) {
    var self = this;
    //    debugger
    //    self.entity = ko.mapping.fromJS({
    //        note: '',
    //        employee: null,
    //        type: Enums.candidateType.recruiter,
    //        userId: Meteor.userId(),
    //    });
    self.employees = ko.meteor.find(Contactables, {
        Employee: {
            $exists: true
        }
    });
    self.employee = ko.observable();
    self.add = function () {
        //        var candidate = ko.toJS(self.entity);
        if (!self.employee())
            return;

        Jobs.update({
            _id: jobId
        }, {
            $set: {
                assignment: self.employee()
            }
        }, function (err, result) {
            if (!err)
                Contactables.update({
                    _id: self.employee()
                }, {
                    $set: {
                        assignment: jobId
                    }
                })
        });
        self.close();
    }
    return self;
}