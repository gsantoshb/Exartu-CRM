
JobsView = new Mongo.Collection("jobsView");

Meteor.paginatedPublish(JobsView, function () {
  if (!this.userId) return [];

  return Utils.filterCollectionByUserHier.call(this, JobsView.find({}, {sort: {dateCreated: -1}}));
}, {
  pageSize: 20,
  publicationName: 'jobsView'
});



// Hooks
Jobs.after.insert(function (userId, job) {
  var jobTypes = _.pluck(dType.ObjTypes.find({parent: Enums.objGroupType.job}).fetch(), 'name');

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

Jobs.after.update(function (userId, job, fieldNames, modifier, options) {
  var update = { $set: {} };

  // Display Name & Public job title
  if (_.contains(fieldNames, 'publicJobTitle') && modifier.$set.publicJobTitle) {
    update.$set.publicJobTitle = modifier.$set.publicJobTitle;
    update.$set.displayName = modifier.$set.publicJobTitle;
  }

  // Process Status
  if (_.contains(fieldNames, 'status') && modifier.$set.status) {
    update.$set.status = modifier.$set.status;
  }

  // Active Status
  if (_.contains(fieldNames, 'activeStatus') && modifier.$set.activeStatus) {
    update.$set.activeStatus = modifier.$set.activeStatus;
  }

  // Number Required
  if (_.contains(fieldNames, 'numberRequired') && modifier.$set.numberRequired) {
    update.$set.numberRequired = modifier.$set.numberRequired;
  }

  // Tags
  if (_.contains(fieldNames,'tags') && modifier.$addToSet && modifier.$addToSet.tags) {
    update.$addToSet = {tags: modifier.$addToSet.tags};
  }
  if (_.contains(fieldNames,'tags') && modifier.$pull && modifier.$pull.tags) {
    update.$pull = {tags: modifier.$pull.tags};
  }

  // Client
  if (_.contains(fieldNames, 'client') && modifier.$set.client) {
    var client = Contactables.findOne(modifier.$set.client);

    update.$set.clientId = modifier.$set.client;
    update.$set.clientDisplayName = client.displayName;
    update.$set.clientDepartmentName = client && client.Client ? client.Client.department : '';
  }

  // Placement counts
  if (_.contains(fieldNames, 'placement')) {
    var placementsCount = Placements.find({job: job._id}).count();
    update.$set.placementsCount = placementsCount;
  }

  // Address
  if (_.contains(fieldNames, 'address') && modifier.$set.address) {
    var address = Addresses.findOne({_id: modifier.$set.address});
    update.$set.address = address;
  }


  // Update job view
  if (!_.isEmpty(update.$set)) {
    JobsView.update({jobId: job._id}, update);
  }
});

Contactables.after.update(function (userId, contactable, fieldNames, modifier, options) {
  JobsView.update({clientId: contactable._id}, {
    $set: {
      clientDisplayName: contactable.displayName,
      clientDepartmentName: contactable.Client ? contactable.Client.department : ''
    }
  }, {multi: true});
});




// Indexes
JobsView._ensureIndex({jobId: 1});
JobsView._ensureIndex({hierId: 1});
JobsView._ensureIndex({userId: 1});
JobsView._ensureIndex({clientId: 1});
JobsView._ensureIndex({dateCreated: 1});
