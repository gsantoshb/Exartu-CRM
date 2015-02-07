
ApplicantCenterManager = {
  createEmployeeForUser: function(userId) {
    // Validate user
    var user = Meteor.users.findOne(userId);
    if (!user) throw new Error('Invalid user ID');

    // Create new employee
    var empId = Contactables.insert({
      objNameArray:['person', 'Employee', 'Contactable'],
      hierId: user.hierId,
      userId: user._id,
      user: user._id,
      person: {
        "firstName" : user.userEmail,
        "lastName" : user.userEmail
      },
      Employee: {}
    });

    if (!empId) throw new Error('An error occurred while creating the corresponding employee');
    return empId;
  }
};

