Tasks = new Meteor.Collection("tasks", {
  transform: function (task) {
    task.user = Meteor.users.findOne({
      _id: task.userId
    });
    task.assignedUsers = _.map(task.assign, function (userId) {
      return Meteor.users.findOne({
        _id: userId
      });
    });
    task = Utils.clasifyTags(task);
    return task
  }
});
