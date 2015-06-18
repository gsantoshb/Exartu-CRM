
Jobs.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (this.previous.jobTitle != doc.jobTitle || this.previous.client != doc.client) {
    setComputedDisplayFields(doc);
    var aftmodifier = {};
    aftmodifier.jobTitleDisplayName = doc.jobTitleDisplayName;
    aftmodifier.clientDisplayName = doc.clientDisplayName;
    aftmodifier.displayName = doc.displayName;
    Jobs.update({_id: doc._id}, {$set: aftmodifier})
  }
}, {fetchPrevious: true});
// Helper Functions
var setComputedDisplayFields = function (doc) {
  if (doc.client) {
    var c = Contactables.findOne(doc.client);
    if (c) doc.clientDisplayName = c.displayName;
  }
  if (doc.jobTitle) {
    var jt = LookUps.findOne(doc.jobTitle);
    if (jt) doc.jobTitleDisplayName = jt.displayName;
  }
  doc.displayName = doc.jobTitleDisplayName + ' @ ' + doc.clientDisplayName;
  return doc;
};


// Tags
Jobs.after.update(function (userId, doc, fieldNames, modifier, options) {
  // in case you delete a tag, it wouldn't be deleted from the tag collection
  if (fieldNames.indexOf('tags') != -1) {
    if (doc.tags != null) {
      _.forEach(doc.tags, function (t) {
        if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
          Tags.insert({tags: t, hierId: doc.hierId});
        }
      })
    }
  }
});


// Jobs View
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


// Notes View
Jobs.after.update(function(userId, doc, fields, update){
  if(update.$set && update.$set['publicJobTitle']){
    NotesView.update({"links.id":doc._id},{$set:{"links.$.displayName": doc.publicJobTitle}},{multi:true})
  }
});


// Placements View
Jobs.after.update(function (userId, job, fieldNames, modifier, options) {
  PlacementsView.update({jobId: job._id}, {
    $set: {
      jobDisplayName: job.publicJobTitle
    }
  }, {multi: true});
});
