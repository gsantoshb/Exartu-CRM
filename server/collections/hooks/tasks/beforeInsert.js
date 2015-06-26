
Tasks.before.insert(function (userId, doc) {
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.dateCreated = doc.dateCreated || Date.now();
  doc.task = true
});

