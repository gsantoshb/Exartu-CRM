Placements = new Meteor.Collection('placements', {
  transform: function (placement) {
    if (placement.status != null) {
      placement.statusName = LookUps.findOne({ _id: placement.status }).displayName;
    }
    var employee = Contactables.findOne(placement.employee);
    var job = Jobs.findOne(placement.job);
    placement.displayName = (employee && employee.displayName) + ' @ ' + (job && job.displayName);

    return placement;
  }
});

AllPlacements = new Meteor.Collection('allPlacements', {
  transform: function (placement) {
    if (placement.status != null) {
      placement.statusName = LookUps.findOne({ _id: placement.status }).displayName;
    }
    var employee = Contactables.findOne(placement.employee);
    var job = Jobs.findOne(placement.job);
    placement.displayName = (employee && employee.displayName) + ' @ ' + (job && job.displayName);

    return placement;
  }
});

