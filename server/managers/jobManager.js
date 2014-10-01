JobManager = {
  create: function() {
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
  }
};