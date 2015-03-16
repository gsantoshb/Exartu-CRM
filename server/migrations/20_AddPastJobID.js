
Migrations.add({
  version: 20,
  up: function() {
    var contactableCursor = Contactables.find({pastJobs: {$exists: true, $ne: []}});

    contactableCursor.forEach(function (contactable) {
      var pastJobsField = [];

      // Generate a new ID for each education record
      contactable.pastJobs.forEach(function (pastJob) {
        pastJob.id = Random.id();
        pastJobsField.push(pastJob);
      });

      // Update the education record with the new information
      Contactables.update({_id: contactable._id}, {$set: {pastJobs: pastJobsField}});
    });
  }
});