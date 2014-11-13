JobManager = {
  create: function(job) {
    return Jobs.insert(job);
  },
  copy: function(jobId) {
    var job = Jobs.findOne(jobId);

    if (job.hierId != Meteor.user().hierId)
      throw new Meteor.Error(500, 'User not allowed to copy the job');

    var jobCopy = _.pick(job, 'objNameArray', 'customer', 'hierId', 'jobTitle', 'duration', 'numberRequired', 'publicJobTitle');

    // Default values
    jobCopy.startDate = new Date();
    var ret = Jobs.insert(jobCopy);

    return ret;
  },
  setAddress: function (jobId, addressInfo) {
    // Validation
    if (! jobId) { throw new Error('Job ID is required'); }
    if (! addressInfo) { throw new Error('Address information is required'); }

    // Job method insertion
    Jobs.update({ _id: jobId }, { $set: { location: addressInfo } }, function (err, result) {
      if (err) { throw err; }
      return result;
    });
  },

  getJobTitles: function () {
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    return LookUps.find({ hierId: rootHier, lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode }).fetch();
  },

  getJobDurations: function () {
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    return LookUps.find({ hierId: rootHier, lookUpCode: Enums.lookUpTypes.job.duration.lookUpCode }).fetch();
  },

  getJobStatus: function () {
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    return LookUps.find({ hierId: rootHier, lookUpCode: Enums.lookUpTypes.job.status.lookUpCode }).fetch();
  }
};