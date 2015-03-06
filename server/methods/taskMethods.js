Meteor.methods({
  apiAddTask: function (task) {
    try {
      return TaskManager.apiAddTask(task);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  apiGetTasks: function(entityId) {
    try {
      return TaskManager.apiGetTasks(entityId);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  },
  apiGetTasksBeetwen: function(start, end){
      try {

          return TaskManager.apiGetTasksBeetwen(start, end);
      } catch(err) {
          throw new Meteor.Error(err.message);
      }

  },
  notifyTask: function(task){

  try {
    _.each(task.assign, function(a){
      var u = UserManager.getUserInformation(a);
      Meteor.call('sendEmail', u.email, "New task assigned", "Dear user,\n\n  You have been assigned to a task. " +
      "Please check your tasks list:\n"+Meteor.absoluteUrl("tasks")+"\nThank you,\nAïda team.", false);
    });

  } catch(err) {
      throw new Meteor.Error(err.message);
  }

}

});

