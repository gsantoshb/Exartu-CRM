Meteor.publish('jobs', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Jobs.find({
        hierId: user.hierId
    });
})

Jobs.allow({
    update: function () {
        return true;
    }
});

Jobs.before.insert(function (userId, doc) {
    var user = Meteor.user();
    doc.hierId = user.hierId;
    doc.userId = user._id;
    doc.createdAt = Date.now();
});

Meteor.startup(function () {
    Meteor.methods({
        addJob: function (job) {
            job._id = new Meteor.Collection.ObjectID()._str;
            if (beforeInsertOrUpdateJob(job)) {
                Jobs.insert(job);
            } else {
                console.error('Job is not valid')
                console.dir(job);
            }
        }
    });
});

/*
 * extends and validate a job before inserting or updating
 */
var beforeInsertOrUpdateJob = function (job) {
    var user = Meteor.user();
    if (user == null)
        throw new Meteor.Error(401, "Please login");

    if (!job.objNameArray || !job.objNameArray.length) {
        console.error('the job must have at least one objName');
        throw new Meteor.Error(401, "invalid contactable");
    }
    var objTypes = ObjTypes.find({
        objName: {
            $in: job.objNameArray
        }
    }).fetch();

    if (objTypes.length != job.objNameArray.length) {
        console.error('the job objNameArray is suspicious');
        console.dir(job.objNameArray);
        throw new Meteor.Error(401, "invalid objNameArray");
    }
    extendJob(job, objTypes);

    return validate(job, objTypes);
};

/*
 * extend a job with assignments, candidates and the services defined in objTypes
 * objTypes must be an array with the object's types that the job references
 */
var extendJob = function (job, objTypes) {
    if (!job.assignment)
        job.assignment = null;
    if (!job.candidates)
        job.candidates = [];
    _.forEach(objTypes, function (objType) {
        _.forEach(objType.services, function (service) {
            if (job[service] == undefined)
                job[service] = [];
        });
    });
}

/*
 * validate a job
 * objTypes must be an array with the object's types that the job references
 */
var validate = function (job, objTypes) {
    var v = true;
    _.every(objTypes, function (objType) {
        v = validateObjType(job, objType);
        return v;
    });

    return v;
};