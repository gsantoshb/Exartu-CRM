
Migrations.add({
  version: 38,
  up: function () {
    var taskCursor = Tasks.find({});
    var total = taskCursor.count();
    var count = 0;
    console.log('migrating ' + total + ' tasks');

    taskCursor.forEach(function (task) {
      ++count;
      console.log(count + '/' + total + ' - ['+ task._id + ']');
      if (! Notes.findOne({_oldTaskId: task._id}, {_id:1})){
        Notes.insert({
          msg : task.msg,
          remindDate : task.begin,
          links : task.links,
          hierId : task.hierId,
          userId : task.userId,
          _oldTaskId: task._id
        })
      }
    });
  }
});
