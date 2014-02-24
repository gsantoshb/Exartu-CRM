Template.candidateAdd.viewModel = function (jobId) {
    var self = this;
    //    debugger
    self.entity = ko.mapping.fromJS({
        note: '',
        employee: null,
        type: Enums.candidateType.recruiter,
        userId: Meteor.userId(),
    });
    self.employees = ko.meteor.find(Contactables, {
        Employee: {
            $exists: true
        }
    });
    self.add = function () {
        var candidate = ko.toJS(self.entity);
        if (!candidate.employee)
            return;
        candidate.cratedAt = new Date();
        Jobs.update({
            _id: jobId
        }, {
            $addToSet: {
                candidates: candidate
            }
        });
        self.close();
    }
    return self;
}