
Migrations.add({
  version: 23,
  up: function () {
    var resumeCursor = Resumes.find({});

    resumeCursor.forEach(function (resume) {
      // Get the contactable
      var employee = Contactables.findOne({_id: resume.employeeId});
      if (employee) {
        // Update the resume record with the hier ID
        Resumes.update({_id: resume._id}, {$set: {hierId: employee.hierId}});
      }
    });
  }
});
