Meteor.methods({
  addJob: function (job) {
    return JobManager.create(job);
  },
  'copyJob': function (jobId) {
    return JobManager.copy(jobId);
  },
  setJobAddress: function (jobId, addressInfo) {
    return JobManager.setAddress(jobId, addressInfo);
  }
});