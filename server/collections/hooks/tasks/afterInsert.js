
// Activities
Tasks.after.insert(function (userId, doc) {
  var obj = {
    userId: doc.userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.taskAdd,
    entityId: doc._id,
    links: _.map(doc.links, function (link) {
      return link.id;
    }),
    data: {
      taskId: doc._id,
      dateCreated: new Date()
    }
  };

  if (doc && doc.testData) obj.testData = true;

  Activities.insert(obj);
});
