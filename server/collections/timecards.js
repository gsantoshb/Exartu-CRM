
TimecardsView = new View('timecards', {
  collection: Timecards,
  cursors: function (timecard) {
    // Placement view with info
    this.publish({
      cursor: function (timecard) {
        return PlacementView.find(timecard.placementId);
      },
      to: 'placements'
    });
  }
});


Meteor.publish('timecards', function (weekendDate) {
  if (weekendDate) {
    return Utils.filterCollectionByUserHier.call(this, TimecardsView.find({weekendDate: weekendDate}, {
      fields: {
        weekendDate: 1,
        placementId: 1,
        regularHours: 1,
        overtimeHours: 1,
        doubleTimeHours: 1,
        createdAt: 1
      }
    }));
  } else {
    this.ready();
  }
});

Meteor.publish('timecardInfo', function (timecardId) {
  if (timecardId) {
    return Utils.filterCollectionByUserHier.call(this, TimecardsView.find({_id: timecardId}, {
      fields: {
        weekendDate: 1,
        placementId: 1,
        regularHours: 1,
        overtimeHours: 1,
        doubleTimeHours: 1,
        createdAt: 1
      }
    }));
  } else {
    this.ready();
  }
});

Timecards.before.insert(function (userId, doc) {
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.createdAt = Date.now();
});