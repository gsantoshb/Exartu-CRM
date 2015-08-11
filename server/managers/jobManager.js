JobManager = {
  create: function(job) {
    // Validation
    if (! job.client) { throw new Error('Client is required'); }
    if (! job.jobTitle) { throw new Error('Job title is required'); }

    // Hack to keep both titles the same
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    console.log("id", job.jobTitle);
    console.log("hierId", rootHier);
    console.log("lookup", Enums.lookUpTypes.job.titles.lookUpCode);
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
  },

  //address
  setJobAddress: function (job, address) {

    if (_.isString(job)){
      job = Jobs.findOne(job);
    }

    if (! job){
      throw new Error('job not found');
    }

    if (_.isString(address)) {

      address = Addresses.findOne(address);

      if (! address){
        throw new Error('address not found');
      }
    }else {

      address.linkId = job._id;
      address._id = AddressManager.addEditAddress(address);
    }

    if (job.address && job.address != address._id){
      var oldAddress = Addresses.findOne(job.address);
      if (oldAddress && (oldAddress.linkId == job._id)){
        Addresses.remove({_id: oldAddress._id});
      }
    }

    Jobs.update({ _id: job._id }, { $set: { address: address._id } });
  },
  removeJobAddress: function (address) {
    if (_.isString(address)){
      address = Addresses.findOne(address);
    }

    if (! address){
      throw new Error('address not found');
    }

    var job = Jobs.findOne(address.linkId);

    if (! job){
      throw new Error('job not found');
    }

    Jobs.update({ _id: job._id }, { $unset: { address: '' } });

    Addresses.remove({_id: address._id});
  },
  getJobById: function(jobId){
    return Jobs.findOne({_id:jobId});
  },
  updateJob: function(jobId, jobUpdate){
     Jobs.update({_id: jobId},jobUpdate);
  },
  updateLegalInfo: function(update, contactableId){
    var querySet = {};
    var queryUnset = {};

    if(update.$set.convictions ){
      _.extend(querySet, {'Employee.convictions':update.$set.convictions});
    }
    if(update.$set.gender ){
      _.extend(querySet, {'Employee.gender':update.$set.gender});
    }
    if(update.$set.ethnicity ){
      _.extend(querySet, {'Employee.ethnicity':update.$set.ethnicity});
    }
    if(update.$set.i9OnFile ){
      _.extend(querySet, {'Employee.i9OnFile':update.$set.i9OnFile});
    }
    if(update.$set.i9ExpireDate ){
      _.extend(querySet, {'Employee.i9ExpireDate':update.$set.i9ExpireDate});
    }
    if(update.$set.dependentNumber ){
      _.extend(querySet, {'Employee.dependentNumber':update.$set.dependentNumber});
    }
    if(update.$set.orientationDate ){
      _.extend(querySet, {'Employee.orientationDate':update.$set.orientationDate});
    }
    if(update.$set.hireDate ){
      _.extend(querySet, {'Employee.hireDate':update.$set.hireDate});
    }

    if(update.$unset) {
      if(update.$unset.convictions != undefined){
        _.extend(queryUnset, {'Employee.convictions':update.$unset.convictions});
      }
      if(update.$unset.gender!= undefined ){
        _.extend(queryUnset, {'Employee.gender':update.$unset.gender});
      }
      if(update.$unset.ethnicity != undefined){
        _.extend(queryUnset, {'Employee.ethnicity':update.$unset.ethnicity});
      }
      if(update.$unset.i9OnFile != undefined){
        _.extend(queryUnset, {'Employee.i9OnFile':update.$unset.i9OnFile});
      }
      if(update.$unset.i9ExpireDate!= undefined ){
        _.extend(queryUnset, {'Employee.i9ExpireDate':update.$unset.i9ExpireDate});
      }
      if(update.$unset.dependentNumber!= undefined ){
        _.extend(queryUnset, {'Employee.dependentNumber':update.$unset.dependentNumber});
      }
      if(update.$unset.orientationDate!= undefined ){
        _.extend(queryUnset, {'Employee.orientationDate':update.$unset.orientationDate});
      }
      if(update.$unset.hireDate!= undefined ){
        _.extend(queryUnset, {'Employee.hireDate':update.$unset.hireDate});
      }
    }

    var update = {};
    if(!_.isEmpty(querySet))
      update.$set = querySet;
    if(!_.isEmpty(queryUnset))
      update.$unset = queryUnset;
    Contactables.update({_id: contactableId},update);

  }
};