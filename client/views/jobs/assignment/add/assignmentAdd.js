Template.assignmentAdd.viewModel = function (jobId, employeeId) {
    var self = this;

    self.edit = employeeId != undefined;
    self.employees = ko.meteor.find(Contactables, {
        Employee: {
            $exists: true
        }
    });
    self.filter = function(data) {
      return data._id;
    }
    self.canSave=ko.observable(true);
    self.employee = ko.observable(employeeId);
    self.add = function () {
        if (!self.employee())
            return;
        self.canSave(false);
        Meteor.call('assign', jobId , self.employee(),function(err, result){
            self.canSave(true);
            if(!err){
                self.close();
            }else{
                console.log(err);
            }
        });
    }
    return self;
}