JobManager = {
  create: function(job) {
    // Validation
    if (! job.customer) { throw new Error('Customer is required'); }
    if (! job.jobTitle) { throw new Error('Job title is required'); }
    if (! job.startDate) { throw new Error('Start date is required'); }

    // Hack to keep both titles the same
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    job.publicJobTitle = LookUps.findOne({ _id: job.jobTitle, hierId: rootHier, lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode }).displayName;

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

  getJobs: function (customerId) {
    return Utils.filterCollectionByUserHier.call({ userId: Meteor.userId() }, Jobs.find({ customer: customerId }, { sort: { 'dateCreated': -1 } })).fetch();
  },

  // Job Lookups
  addJobTitle: function (displayName) {
    // Validation
    if (!displayName) { throw new Error('Display name is required'); }

    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    var existing = LookUps.findOne({ hierId: rootHier, displayName: displayName, lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode });
    if (existing !== undefined) {
      throw new Error('A job title with the provided display name already exist');
    }

    return LookUps.insert({
      displayName: displayName,
      lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode,
      hierId: rootHier
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