Migrations.add({
  version: 6,
  up: function () {
    Placements.find().forEach(function (placement, index, cursor) {
      Candidates.update({ job: placement.job, employee: placement.employee}, { $set: { assigned: true }});
    })
  }
});