
ContactablesFiles.before.insert(function (userId, doc) {
  doc.dateCreated = Date.now();
});
