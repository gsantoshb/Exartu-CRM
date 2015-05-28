
Migrations.add({
  version: 31,
  up: function () {
    var count = 0;

    Placements.find({}).forEach(function (placement) {
      // Check that the placement view record doesn't exist yet
      if (!PlacementsView.findOne({placementId: placement._id})) {
        count++;
        console.log('adding placement view ', count, '-', placement._id);

        PlacementsView.insert({
          placementId: placement._id,
          hierId: placement.hierId,
          employeeId: placement.employee,
          employeeDisplayName: placement.employeeDisplayName,
          jobId: placement.job,
          jobDisplayName: placement.jobDisplayName,
          candidateStatus: placement.candidateStatus,
          activeStatus: placement.activeStatus,
          userId: placement.userId,
          startDate: placement.startDate,
          endDate: placement.endDate,
          dateCreated: placement.dateCreated,
          placementRates: placement.placementRates,
          tags: placement.tags,
          displayName: placement.displayName
        });
      }
    });

    console.log('Finished migration 31');
  }
});
