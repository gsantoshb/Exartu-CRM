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
  findJob: function (query) {
    return Utils.filterCollectionByUserHier.call({ userId: Meteor.userId() }, Jobs.find({
      'publicJobTitle': {
        $regex: query,
        $options: 'i'
      }
    }, {
      fields: { 'publicJobTitle': 1, 'clientDisplayName': 1, 'dateCreated': 1}
    }
    )).fetch();
  },
  getJobs: function(clientId) {
    try {
      return JobManager.getJobs(clientId);
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

  // Client
  setJobClient: function (jobId, clientId) {
    return JobManager.setClient(jobId, clientId);
  },

  // address
  setJobAddress: function (jobId, addressId) {
    return JobManager.setJobAddress(jobId, addressId);
  },

  removeJobAddress: function (addressId) {
    return JobManager.removeJobAddress(addressId);
  }
});