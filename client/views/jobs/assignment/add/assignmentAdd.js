Template.assignmentAdd.viewModel = function (jobInfo, employeeId) {
    var self = this,
        jobId='',
        job=jobInfo;
    if(_.isObject(jobInfo)){
        jobId=jobInfo._id;
        job=jobInfo;
    }else{
        jobId=jobInfo;
        job=Jobs.findOne({_id: jobId});
    }
    var rates=Enums.rates;
    var getPayRates=function(){

        var result={};

        if(job.Temporary){
            var pay=parseInt(job.Temporary.pay) || 0;
            result[rates.regular]=pay;
            result[rates.doubleTime]=pay * 2;
            result[rates.overTime]=pay * 1.5;
        }else if (job['Direct Hire']){
            result.salary=parseInt(job['Direct Hire'].salary);
        }
        return result;
    };
    var getBillRates=function(){
        var result={};

        if(job.Temporary){
            var bill=parseInt(job.Temporary.pay) || 0;
            var fee=parseInt(job.Temporary.fee) || 0;
            fee=fee/100;
            bill= bill + bill*(fee);

            result[rates.regular]= bill;
            result[rates.doubleTime]= bill * 2;
            result[rates.overTime]= bill * 1.5;

        }else if (job['Direct Hire']){
            var salary= parseInt(job['Direct Hire'].salary) || 0;
            var fee= job['Direct Hire'].fee || 0;
            fee=fee/100;

            result.bill= salary + salary*fee;
        }
        return result;
    };

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
    self.employee = ko.observable(job.employeeAssigned);

    var oldAssignment=Assignments.findOne({_id: job.assignment}) || {};

    self.info= ko.mapping.fromJS({
        start: oldAssignment.start || new Date(),
        end: oldAssignment.end || null,
        payRate: oldAssignment.rates ? oldAssignment.rates.payRate || getPayRates(): getPayRates(),
        billRate: oldAssignment.rates ? oldAssignment.rates.billRate || getBillRates(): getBillRates()
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