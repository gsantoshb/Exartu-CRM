
Notes.before.insert(function(userId, doc){
  doc.dateCreated = doc.dateCreated || Date.now();
  if (doc.hierId)
    return doc; // It was created by the system, e.g.: from a SMS sent by a contactable

  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;

  return doc;
});
