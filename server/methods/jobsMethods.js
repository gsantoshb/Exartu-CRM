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
  findJob: function (query) {
    return Utils.filterCollectionByUserHier.call({ userId: Meteor.userId() }, Jobs.find({
      'publicJobTitle': {
        $regex: query,
        $options: 'i'
      }
    }, { fields: { 'publicJobTitle': 1 } })).fetch();
  }
});