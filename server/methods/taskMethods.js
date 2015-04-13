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
    updateTask: function (task){
      try{
        TaskManager.updateTask(task);
      }
      catch(err){
        throw new Meteor.Error(err.message);
      }
    }

});

