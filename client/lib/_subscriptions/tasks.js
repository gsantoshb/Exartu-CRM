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
    var now = moment(new Date())
    if (task.completed == undefined) {
      task.completed = null;
    }
    if (now.isBefore(task.begin)) {
      task.state = Enums.taskState.future;
    } else {
      if (task.completed) {
        task.state = Enums.taskState.completed;
      } else {
        if (now.isBefore(task.end)) {
          task.state = Enums.taskState.pending;
        } else {
          task.state = Enums.taskState.closed;
        }

      }
    }
    return task;
  }
});
extendedSubscribe("tasks", 'TasksHandler');