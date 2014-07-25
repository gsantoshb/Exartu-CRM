Migrations.add({
  version: 6,
  up: function () {
    Assignments.find().forEach(function (assignment, index, cursor) {
      Candidates.update({ job: assignment.job, employee: assignment.employee}, { $set: { assigned: true }});
    })
  }
});