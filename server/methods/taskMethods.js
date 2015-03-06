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
      Meteor.call('sendEmail', u.email, "New task assigned", "You have been assigned to a task", false);
    });

  } catch(err) {
      throw new Meteor.Error(err.message);
  }

}

});

