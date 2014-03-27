Meteor.publish('assignment', function () {

    if (!this.userId)
        return false;

    return Assignment.find();
})

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