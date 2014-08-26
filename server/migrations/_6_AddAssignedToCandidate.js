Migrations.add({
  version: 6,
  up: function () {
    Matchups.find().forEach(function (matchup, index, cursor) {
      Candidates.update({ job: matchup.job, employee: matchup.employee}, { $set: { assigned: true }});
    })
  }
});