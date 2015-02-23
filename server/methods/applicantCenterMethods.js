
Meteor.methods({
  createEmployeeForUser: function(userId, firstName, lastName) {
    // Validate parameters
    check(userId, String);
    check(firstName, String);
    check(lastName, String);

    try {
      return ApplicantCenterManager.createEmployeeForUser(userId, firstName, lastName);
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
  },

  syncEmployeeFromInvitation: function (userId, firstName, lastName, invitationId) {
    // Validate parameters
    check(userId, String);
    check(firstName, String);
    check(lastName, String);
    check(invitationId, String);

    try {
      return ApplicantCenterManager.syncEmployeeFromInvitation(userId, firstName, lastName,invitationId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },

  getDocCenterDocuments: function (userId) {
  // Validate parameters
    check(userId, String);

    try {
      return ApplicantCenterManager.getDocCenterDocuments(userId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },

  getDocCenterToken: function (userId) {
    // Validate parameters
    check(userId, String);

    try {
      return ApplicantCenterManager.getDocCenterToken(userId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
});
