
Migrations.add({
  version: 30,
  up: function () {
    var count = 0;
    var jobTypes = _.pluck(dType.ObjTypes.find({parent: Enums.objGroupType.job}).fetch(), 'name');

    Jobs.find({}).forEach(function (job) {
      // Check that the job view record doesn't exist yet
      if (!JobsView.findOne({jobId: job._id})) {
        count++;
        console.log('adding job view ', count, '-', job._id);

        var type = _.find(job.objNameArray, function (obj) {return jobTypes.indexOf(obj) != -1});
        var client = Contactables.findOne(job.client);
        var placementsCount = Placements.find({job: job._id}).count();
        var address = Addresses.findOne({_id: job.address});

        JobsView.insert({
          jobId: job._id,
          hierId: job.hierId,
          type: type,
          displayName: job.displayName,
          publicJobTitle: job.publicJobTitle,
          tags: job.tags,
          clientId: job.client,
          clientDisplayName: client.displayName,
          clientDepartmentName: client && client.Client ? client.Client.department : '',
          status: job.status,
          activeStatus: job.activeStatus,
          userId: job.userId,
          dateCreated: job.dateCreated,
          numberRequired: job.numberRequired,
          placementsCount: placementsCount,
          address: address
        });
      }
    });

    console.log('Finished migration 30');
  }
});

