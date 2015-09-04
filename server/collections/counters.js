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
    Placements.find({job: jobId}),
    WorkFlows.find({jobId: jobId})

  ];

  generateCounterPublish(this, 'jobCounters', cursors);
});

Meteor.publish("activityCounters", function () {
  console.log('activityCounters');
  var sub = this;
  Hierarchies.find().forEach(function (hier) {
    var activityCursor = Activities.find({ hierId: hier._id });
    var lastActivity = Activities.findOne({ hierId: hier._id }, { sort: { 'data.dateCreated': -1 } })

    sub.added('activityCounters', hier._id, {
      activityCount: activityCursor.count(),
      lastDate: lastActivity && lastActivity.data && lastActivity.data.dateCreated
    });

    //todo: observe activityCursor
  });

  //sub.onStop(function(){
  //
  //});

  sub.ready();
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
  });

  ctx.ready();
};