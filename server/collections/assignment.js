Meteor.publish('assignment', function () {

    if (!this.userId)
        return false;

    return Assignment.find();
});


//<editor-fold desc="************ update job and contactable ****************">
Assignment.before.insert(function(userId, doc){
    if(!doc._id){
        doc._id=Meteor.uuid();
    }
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            jobAssigned: doc.job,
            assignment: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            employeeAssigned: doc.employee,
            assignment: doc._id
        }
    });
})
//before set the employee and job in null becouse they may change
Assignment.before.update(function(userId, doc, fieldNames, modifier, options){

    if (modifier && modifier.$set && modifier.$set.employee && (modifier.$set.employee != doc.employee)){
       Contactables.update({
            _id: doc.employee
        }, {
            $set: {
                jobAssigned: null,
                assignment: null
            }
        });
    }
//        Jobs.update({
//            _id: doc.job
//        }, {
//            $set: {
//                employeeAssigned: null,
//                assignment: null
//            }
//        });

});
//after update the employee and job
Assignment.after.update(function(userId, doc, fieldNames, modifier, options){
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            jobAssigned: doc.job,
            assignment: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            employeeAssigned: doc.employee,
            assignment: doc._id
        }
    });
});
//</editor-fold>

Meteor.startup(function(){
    createAssignment= function(job, employee, assignmentInfo){
        if (!job||!employee){
            throw new Error('parameters must not be null')
        }
        assignmentInfo= assignmentInfo || {};

        var assignment={
            employee: employee._id,
            job: job._id,
            jobType: job.objNameArray[0]
        }
        assignment.start= assignmentInfo.start ? assignmentInfo.start : new Date();
        assignment.end= assignmentInfo.end ? assignmentInfo.end : null;
        assignment.rates= createRates(job, assignmentInfo);
        assignment.qualification= null;

        return Assignment.insert(assignment);
    };

    createRates= function(job, assignmentInfo){
        var payRatesInfo= assignmentInfo.payRate || {};
        var billRatesInfo= assignmentInfo.billRate || {};
        var rate= {
            payRate:payRatesInfo,
            billRate:billRatesInfo
        };
//        if (job.Temporary){
//
//            var frequency = LookUps.find({ codeType: Enums.lookUpTypes.payRate.frequencies.code, code: job.Temporary.frequency });
//
//            if (!rate.payRate.regular){
//                rate.payRate.regular = frequency ? (job.Temporary.pay / frequency.hours) : null;
//            }
//            if (!rate.payRate.overTime){
//                rate.payRate.regular = frequency ? (job.Temporary.pay / frequency.hours) : null;
//            }
//            if (!rate.payRate.doubleTime){
//                rate.payRate.regular = frequency ? (job.Temporary.pay / frequency.hours) : null;
//            }
//        }else if (job['Direct Hire']){
//
//            if (!rate.payRate.salary){
//                rate.payRate.salary = job['Direct Hire'].salary;
//            }
//        }
        return rate;
    }
})