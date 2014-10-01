Meteor.methods({
  addJob: function (job) {
    return JobManager.create(job);
  },
  'copyJob': function (jobId) {
    return JobManager.copy(jobId);
  }
});