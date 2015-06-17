
Addresses.before.insert(function (userId, doc) {
  var user = Meteor.users.find({_id: userId});
  doc.dateCreated = Date.now();
  doc.userId = userId;
  doc.hierId = user.currentHierId;
});
