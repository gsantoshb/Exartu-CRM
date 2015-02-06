
Meteor.methods({
  createEmployeeForUser: function(userId) {
    // Validate parameters
    check(userId, String);

    try {
      return ApplicantCenterManager.createEmployeeForUser(userId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});
