
Placements.after.update(function (userId, doc, fieldNames, modifier, options) {
  // in case you delete a tag, it wouldn't be deleted from the tag collection
  if (fieldNames.indexOf('tags') != -1) {
    if (doc.tags != null) {
      _.forEach(doc.tags, function (t) {
        if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
          Tags.insert({tags: t, hierId: doc.hierId});
        }
      })
    }
  }
});

Placements.after.insert(function (userId, doc) {
  if (doc.tags != null) {
    _.forEach(doc.tags, function (t) {
      if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
        Tags.insert({tags: t, hierId: doc.hierId});
      }
    })
  }
});