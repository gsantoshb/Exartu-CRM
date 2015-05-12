
Meteor.methods({
  shouldCreateTimecards: function (date) {
    // Validate parameters
    check(date, Date);

    try {
      return TimeEntryManager.shouldCreateTimecards(date);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },

  createTimecards: function (date) {
    // Validate parameters
    check(date, Date);

    try {
      return TimeEntryManager.createTimecards(date);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },

  updateRegularHours: function (timecardsHours) {
    try {
      var result = 0;
      _.each(_.keys(timecardsHours), function (id) {
        result += TimeEntryManager.updateTimecard(id, {regularHours: timecardsHours[id]});
      });
      return result;
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});
