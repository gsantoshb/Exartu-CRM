Template.assignmentAdd.viewModel = function (jobId, employeeId) {
    var self = this;

    self.edit = employeeId != undefined;
    self.employees = ko.meteor.find(Contactables, {
        Employee: {
            $exists: true
        }
    });
    self.employee = ko.observable(employeeId);
    self.add = function () {
        if (!self.employee())
            return;

        Jobs.update({
            _id: jobId
        }, {
            $set: {
                assignment: self.employee()
            }
        });
        self.close();
    }
    return self;
}