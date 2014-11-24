Meteor.methods({
  addJob: function (job) {
    try {
      return JobManager.create(job);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  'copyJob': function (jobId) {
    return JobManager.copy(jobId);
  },
  setJobAddress: function (jobId, addressInfo) {
    return JobManager.setAddress(jobId, addressInfo);
  },

  getJobs: function(customerId) {
    try {
      return JobManager.getJobs(customerId);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },

  // Job Lookups
  addJobTitle: function (displayName) {
    try {
      return JobManager.addJobTitle(displayName);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  getJobTitles: function () {
    try {
      return JobManager.getJobTitles();
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  getJobDurations: function () {
    try {
      return JobManager.getJobDurations();
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  getJobStatus: function () {
    try {
      return JobManager.getJobStatus();
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },

  // Customer
  setJobCustomer: function (jobId, customerId) {
    return JobManager.setCustomer(jobId, customerId);
  }
});