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
          console.log('start', start);
          console.log('end', end);
          return TaskManager.apiGetTasksBeetwen(start, end);
      } catch(err) {
          throw new Meteor.Error(err.message);
      }

  }
});

