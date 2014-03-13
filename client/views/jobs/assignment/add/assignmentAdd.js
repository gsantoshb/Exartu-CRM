Template.assignmentAdd.viewModel = function (jobId, employeeId) {
    var self = this;

    self.edit = employeeId != undefined;
    self.employees = ko.meteor.find(Contactables, {
        Employee: {
            $exists: true
        }
    });
    self.canSave=ko.observable(true);
    self.employee = ko.observable(employeeId);
    self.add = function () {
        if (!self.employee())
            return;
        self.canSave(false)
        Jobs.update({
            _id: jobId
        }, {
            $set: {
                assignment: self.employee()
            }
        }, function (err, result) {
            if (!err){
                Contactables.update({
                    _id: self.employee()
                }, {
                    $set: {
                        assignment: jobId
                    }
                }, function(){
                    debugger;
                    self.canSave(true);

                    self.close();
                })
            } else {
                self.canSave(true);
            }
        });
    }
    return self;
}