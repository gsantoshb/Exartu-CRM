
Meteor.methods({
    apiAddTask: function (task) {
        try {
            return TaskManager.apiAddTask(task);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    },
    apiGetTasks: function (entityId) {
        try {
            return TaskManager.apiGetTasks(entityId);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    },
    apiGetTasksBetween: function (start, end) {
        try {

            return TaskManager.apiGetTasksBetween(start, end);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }

    },
    notifyTask: function (task) {

        //try {
        //    _.each(task.assign, function (a) {
        //        var u = UserManager.getUserInformation(a);
        //        Meteor.call('sendEmail', u.email, "New task assigned", "Dear " + u.email + "\n\n  This is an automated reminder from your Aida software system.  You have a new task assigned to you. " +
        //        "Please check your task list for more information:\n" + Meteor.absoluteUrl("tasks"), false);
        //    });
        //
        //} catch (err) {
        //    throw new Meteor.Error(err.message);
        //}

    },


  addTask: function (task) {
    check(task, {
      msg: String,
      assign: String,
      begin: Date,
      end: Match.Optional(Date),
      completed: Match.Optional(Date),
      link: Match.Optional(String)
    });

    try {
      return TaskManager.addTask(task);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },
  updateTask: function (taskId, taskInfo) {
    check(taskId, String);
    check(taskInfo, {
      msg: String,
      assign: String,
      begin: Date,
      end: Match.Optional(Date),
      completed: Match.Optional(Date),
      link: Match.Optional(String)
    });

    try {
      return TaskManager.updateTask(taskId, taskInfo);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },
  archiveTask: function (taskId) {
    check(taskId, String);
    try {
      return TaskManager.archiveTask(taskId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },
  recoverTask: function (taskId) {
    check(taskId, String);
    try {
      return TaskManager.recoverTask(taskId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
  //pushTask: function (taskId, days) {
  //  check(taskId, String);
  //  check(days, Number);
  //  try {
  //    return TaskManager.pushTask(taskId, days);
  //  } catch (err) {
  //    throw new Meteor.Error(err.message);
  //  }
  //}

});

