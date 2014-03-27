Meteor.publish('assignment', function () {

    if (!this.userId)
        return false;

    return Assignment.find({
        $or: filterByHiers(user.hierId)
    });
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
        assignment.rates= createRates(job, assignmentInfo.rate);
        assignment.qualification= null;

        Assignment.insert(assignment);
    };

    createRates= function(job, ratesInfo){
        ratesInfo= ratesInfo || {};
        if (job.objNameArray.indexOf('Temporary') >= 0){
            var rate= {
                payRate:{
                    regular: ratesInfo.regular
                }
            }
            if (!rate.payRate.regular){
                var frequency = LookUps.find({ codeType: Enums.lookUpTypes.payRate.frequencies.code, code: job.Temporary.frequency });
                rate.payRate.regular = frequency ? (job.Temporary.pay / frequency.hours) : null;
            }
            return rate;
        }

    }
})