
TimeEntryManager = {
  shouldCreateTimecards: function (date) {
    // Validations
    if (!date) throw new Error('Date is required');

    var startDate = new Date(date);
    var endDate = new Date(date);
    endDate.setDate(endDate.getDate()+ 6);

    var count = 0;

    // Find all the placements that were opened during the specified week
    var placementsId = _.pluck(Utils.filterCollectionByUserHier2(Meteor.userId(), Placements.find({
        startDate: {$lte: endDate},
        $or: [{endDate: {$exists: false}}, {endDate: null}, {endDate: {$gte: startDate}}]
      }, {fields: {startDate: 1, endDate: 1}}
    )).fetch(), '_id');

    // Check if there are placements that still don't have a timecard created
    var timecards = Timecards.find({placementId: {$in: placementsId}}).count();
    return timecards != placementsId.length;
  },

  createTimecards: function (date) {
    // Validations
    if (!date) throw new Error('Date is required');

    var startDate = new Date(date);
    var endDate = new Date(date);
    endDate.setDate(endDate.getDate()+ 6);

    var count = 0;

    // Find all the placements that were opened during the specified week
    Utils.filterCollectionByUserHier2(Meteor.userId(), Placements.find({
        startDate: {$lte: endDate},
        $or: [{endDate: {$exists: false}}, {endDate: null}, {endDate: {$gte: startDate}}]
      }, {fields: {job: 1, employee: 1, startDate: 1, endDate: 1}}
    )).forEach(function (placement) {
      // Check that the timecard for this placement was not yet been created
      if (! Timecards.findOne({weekendDate: startDate, placementId: placement._id})) {
        // Create the time card for this placement and weekend date
        Timecards.insert({weekendDate: startDate, placementId: placement._id});
        count++;
      }
    });

    return count;
  },

  updateTimecard: function (timecardId, info) {
    // Validations
    if (!timecardId) throw new Error('Timecard  ID is required');
    if (!info) throw new Error('Timecard information is required');

    // Validate timecard
    var timecard = Utils.filterCollectionByUserHier2(Meteor.userId(), Timecards.find({_id: timecardId}), {fields: {_id: 1}}).fetch();
    if (!timecard) throw new Error ('Invalid timecard ID');

    // Validate info
    if (!info.regularHours && !info.overtimeHours && !info.doubleTimeHours)
      throw new Error('At least one property must be provided to update');

    // Build update object
    var update = {$set: {}};
    if (info.regularHours)
      update.$set.regularHours = info.regularHours;
    if (info.overtimeHours)
      update.$set.overtimeHours = info.overtimeHours;
    if (info.doubleTimeHours)
      update.$set.doubleTimeHours = info.doubleTimeHours;

    // Update the timecard
    return Timecards.update({_id: timecardId}, update);
  }
};
