
Migrations.add({
  version: 19,
  up: function() {
    var contactableCursor = Contactables.find({education: {$exists: true, $ne: []}});

    contactableCursor.forEach(function (contactable) {
      var educationField = [];

      // Generate a new ID for each education record
      contactable.education.forEach(function (education) {
        education.id = Random.id();
        educationField.push(education);
      });

      // Update the education record with the new information
      Contactables.update({_id: contactable._id}, {$set: {education: educationField}});
    });
  }
});