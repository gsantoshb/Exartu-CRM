
// Activities
ContactablesFiles.after.insert(function (userId, doc) {
  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.fileAdd,
    entityId: doc._id,
    links: [doc.entityId],
    data: {
      dateCreated: new Date()
    }
  });
});
