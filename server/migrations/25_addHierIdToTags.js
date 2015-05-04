Migrations.add({
  version: 25,
  up: function () {
    //clear all tags
    Tags.remove({});

    // add them back with hierId
    _.each([Placements, Jobs, Contactables], function (collection) {

      collection.find({},{ tags: 1 }).forEach(function (doc) {

        _.forEach(doc.tags, function (t) {

          if (!Tags.findOne({tags: t, hierId: doc.hierId})) {
            Tags.insert({tags: t, hierId: doc.hierId});
          }

        })
      })
    })
  }
});
