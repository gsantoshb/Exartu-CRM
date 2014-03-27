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
    self.info= ko.mapping.fromJS({
        start: new Date(),
        end: null,
        rate: {
            regular: 0
        }
    });
    self.add = function () {
        if (!self.employee())
            return;
        self.canSave(false);
        Meteor.call('assign', jobId , self.employee(), ko.toJS(self.info),function(err, result){
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