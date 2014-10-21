Placements = new Meteor.Collection('placements', {
  transform: function (placement) {
    if (placement.status != null) {
      placement.statusName = LookUps.findOne({ _id: placement.status }).displayName;
    }
    return placement;
  }
});

