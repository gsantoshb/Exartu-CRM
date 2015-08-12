
Jobs.after.insert(function (userId, doc) {
  var customer = Contactables.findOne(doc.client);
  var clientDisplayName;
  if (customer && customer.organization) clientDisplayName = customer.organization.organizationName;
  var obj = {
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.jobAdd,
    entityId: doc._id,
    links: [doc._id, doc.client],
    data: {
      publicJobTitle: doc.publicJobTitle,
      clientId: doc.client,
      dateCreated: new Date(),
      clientDisplayName: clientDisplayName
    }
  };
  if (doc && doc.testData) obj.testData = true;
  Activities.insert(obj);
});


// Tags
Jobs.after.insert(function (userId, doc) {
  if (doc.tags != null) {
    _.forEach(doc.tags, function (t) {
      if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
        Tags.insert({tags: t, hierId: doc.hierId});
      }
    })
  }
});


// Jobs View
Jobs.after.insert(function (userId, job) {
  var jobTypes = ['Direct Hire', 'Temporary']
  var type = _.find(job.objNameArray, function (obj) {return jobTypes.indexOf(obj) != -1});
  var client = Contactables.findOne(job.client);

  JobsView.insert({
    jobId: job._id,
    hierId: job.hierId,
    type: type,
    displayName: job.displayName,
    publicJobTitle: job.publicJobTitle,
    clientId: job.client,
    clientDisplayName: client.displayName,
    clientDepartmentName: client && client.Client ? client.Client.department : '',
    status: job.status,
    activeStatus: job.activeStatus,
    userId: job.userId,
    dateCreated: job.dateCreated,
    numberRequired: job.numberRequired,
    placementsCount: 0
  });
});
