
Hierarchies.before.insert(function (userId, doc) {
  doc.dateCreated = new Date();
});
