Meteor.publish("contactableCounters", function (contactableId) {
  var cursors = [
    Notes.find({'links.id': contactableId}),
    Tasks.find({'links.id': contactableId}),
    ContactablesFiles.find({entityId: contactableId}),
    Placements.find({employee: contactableId})
  ];

  generateCounterPublish(this, 'contactableCounters', cursors);
});

Meteor.publish("jobCounters", function (jobId) {
  var cursors = [
    Notes.find({'links.id': jobId}),
    Tasks.find({'links.id': jobId}),
    Placements.find({job: jobId})
  ];

  generateCounterPublish(this, 'jobCounters', cursors);
});

var generateCounterPublish = function (ctx, name, cursors) {
  _.forEach(cursors, function(c) {
    var initializing = true;

    var collectionName = c._cursorDescription.collectionName;

    c.observeChanges({
      added: function () {
        if (!initializing)
          ctx.changed(name, collectionName, {count: c.count()});
      },
      removed: function () {
        ctx.changed(name, collectionName, {count: c.count()});
      }
    });

    initializing = false;

    ctx.added(name, collectionName, {
      count: c.count()
    });

    ctx.ready();
  });
};