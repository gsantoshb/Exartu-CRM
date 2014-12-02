JobManager = {
  create: function(job) {
    // Validation
    if (! job.customer) { throw new Error('Customer is required'); }
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

    var jobCopy = _.pick(job, 'objNameArray', 'customer', 'hierId', 'jobTitle', 'duration', 'numberRequired', 'publicJobTitle');

    // Default values

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

  // Customer
  setCustomer: function (jobId, customerId) {
    var userHierarchiesFilter = Utils.filterByHiers(Utils.getUserHierId(Meteor.userId()));

    // Get job
    var job = Jobs.findOne({_id: jobId, $or: userHierarchiesFilter});

    // Check if job exists in user's hierarchies
    if (! job)
      throw new Meteor.Error(404, 'Job with id ' +  jobId + ' not found');

    // If customerId is defined then validate customer, if not set job's customer as null
    if (customerId) {
      // Get customer
      var customer = Contactables.find({_id: customerId, Customer: {$exists: true}, $or: userHierarchiesFilter});

      // Check if it exists in user's hierarchies
      if (customerId && ! customer)
        throw new Meteor.Error(404, 'Customer with id ' +  customerId + ' not found');
    }

    // Update job customer
    Jobs.update({_id: jobId}, {$set: { customer: customerId}});
  },

  // Placements
  addPlacement: function (placement) {
    // Validate job
    var job = Jobs.findOne(placement.job);
    if (! job)
      throw new Meteor.Error(404, "Placment's job not found");

    // Validate employee
    var employee = Contactables.findOne({_id: placement.employee, objNameArray: 'Employee'});
    if (! employee)
      throw new Meteor.Error(404, 'Placement employee not found');

    // Validate status
    console.log('candidateStatus', placement.candidateStatus)
    var status = LookUps.findOne({_id: placement.candidateStatus, lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode});
    if (! status)
      throw new Meteor.Error(404, 'Placement status not found');

    // If placement's job has another placement then keep its rates
    var lastJobPlacement = Placements.findOne({job: placement.job}, {sort: { dateCreated: -1}});
    if (lastJobPlacement)
      placement.placementRates = lastJobPlacement.placementRates;

    return Placements.insert(placement);
  }
};