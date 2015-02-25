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
  apiGetTasksBetween: function(start, end){
      try {
          console.log('start', start);
          console.log('end', end);
          return TaskManager.apiGetTasksBetween(start, end);
      } catch(err) {
          throw new Meteor.Error(err.message);
      }

  }
});

