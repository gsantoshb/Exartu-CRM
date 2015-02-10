
Meteor.methods({
  createEmployeeForUser: function(userId) {
    // Validate parameters
    check(userId, String);

    try {
      return ApplicantCenterManager.createEmployeeForUser(userId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },

  inviteEmployeeToAppCenter: function (employeeId, email) {
    // Validate parameters
    check(employeeId, String);
    check(email, Match.Where(function (addr) {
      return SimpleSchema.RegEx.Email.test(addr);
    }));

    try {
      return ApplicantCenterManager.inviteEmployee(employeeId, email);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});
