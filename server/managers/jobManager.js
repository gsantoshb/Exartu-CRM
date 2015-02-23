JobManager = {
  create: function(job) {
    // Validation
    if (! job.client) { throw new Error('Client is required'); }
    if (! job.jobTitle) { throw new Error('Job title is required'); }

    // Hack to keep both titles the same
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    job.publicJobTitle = LookUps.findOne({ _id: job.jobTitle, hierId: rootHier, lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode }).displayName;

    return Jobs.insert(job);
  },
  copy: function(jobId) {
    var job = Jobs.findOne(jobId);

    if (job.hierId != Meteor.user().hierId)
      throw new Meteor.Error(500, 'User not allowed to copy the job');

    var jobCopy = _.pick(job, 'objNameArray', 'client', 'hierId', 'jobTitle', 'duration', 'numberRequired', 'publicJobTitle');

    // Default values

    var ret = Jobs.insert(jobCopy);

    return ret;
  },

  getJobs: function (clientId) {
    return Utils.filterCollectionByUserHier.call({ userId: Meteor.userId() }, Jobs.find({ client: clientId }, { sort: { 'dateCreated': -1 } })).fetch();
  },

  // Job Lookups
  addJobTitle: function (displayName) {
    // Validation
    if (!displayName) { throw new Error('Display name is required'); }

    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    var existing = LookUps.findOne({ hierId: rootHier, displayName: displayName, lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode });
    if (existing !== undefined) {
      throw new Error('A job title with the provided display name already exists');
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
  },

  // Client
  setClient: function (jobId, clientId) {
    var userHierarchiesFilter = Utils.filterByHiers(Utils.getUserHierId(Meteor.userId()));

    // Get job
    var job = Jobs.findOne({_id: jobId, $or: userHierarchiesFilter});

    // Check if job exists in user's hierarchies
    if (! job)
      throw new Meteor.Error(404, 'Job with id ' +  jobId + ' not found');

    // If clientId is defined then validate client, if not set job's client as null
    if (clientId) {
      // Get client
      var client = Contactables.find({_id: clientId, Client: {$exists: true}, $or: userHierarchiesFilter});

      // Check if it exists in user's hierarchies
      if (clientId && ! client)
        throw new Meteor.Error(404, 'Client with id ' +  clientId + ' not found');
    }

    // Update job client
    Jobs.update({_id: jobId}, {$set: { client: clientId}});
  }
};