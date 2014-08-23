Meteor.publish('jobs', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Jobs.find({
        $or: filterByHiers(user.hierId)
    });
})

Jobs.allow({
    update: function () {
        return true;
    }
});
Jobs.before.insert(function (userId, doc) {
  try{
    var user = Meteor.user() || {};
  }catch (e){
    //when the insert is trigger from the server
    var user= { }
  }
  doc.hierId = user.hierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.require('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
});
Meteor.startup(function () {
    Meteor.methods({
      addJob: function (job) {
        if (true) {
          job._id = new Meteor.Collection.ObjectID()._str;
          Jobs.insert(job);
          return job;
        }
      },
      updateJob: function (job) {
          if (beforeInsertOrUpdateJob(job)) {
              Jobs.update({
                  _id: job._id
              }, job);
          } else {
              console.error('Job not valid')
              console.dir(Job);
          }
      },
      updateCandidatesNegotiation: function(data) {
        Jobs.update(
          {
            _id: data.jobId,
            'candidates.employee': data.employeeId
          },
          {
            $set: {
              'candidates.$.negotiation': data.negotiation
            }
          }
        )
      }
    });
});

/*
 * extends and validate a job  inserting or updating
 */
var beforeInsertOrUpdateJob = function (job) {
    var user = Meteor.user();
    if (user == null && !Meteor.settings.demo)
        throw new Meteor.Error(401, "Please sign in");

    if (!job.objNameArray || !job.objNameArray.length) {
        console.error('the job must have at least one objName',job);
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
 * extend a job with list, candidates and the services defined in objTypes
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

// indexes
Jobs._ensureIndex({hierId: 1});
Jobs._ensureIndex({objNameArray:1});
