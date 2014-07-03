Meteor.publish('notes', function () {
  console.dir(Notes.findOne());
  return Notes.find();
})

Notes.allow({
  insert: function (userId, doc) {
    return true
  }
});

Notes.before.insert(function(userId, doc){
  var user = Meteor.user();
  doc.hierId = user.hierId;
  doc.userId = user._id;
  doc.createdAt = Date.now();

  console.log('New post ');
  console.dir(doc);
  return doc;
})