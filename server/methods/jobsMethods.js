Meteor.methods({
  addJob: function (job) {
    return JobManager.create(job);
  },
  'copyJob': function (jobId) {
    return JobManager.copy(jobId);
  },
  setJobAddress: function (jobId, addressInfo) {
    return JobManager.setAddress(jobId, addressInfo);
  },

  getJobs: function(customerId) {
    return JobManager.getJobs(customerId);
  },

  // Job Lookups
  getJobTitles: function () {
    return JobManager.getJobTitles();
  },
  getJobDurations: function () {
    return JobManager.getJobDurations();
  },
  getJobStatus: function () {
    return JobManager.getJobStatus();
  }
});