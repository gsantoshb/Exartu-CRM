var pushDays = 0;
var options,
  originalUrl,
  task = new ReactiveVar(undefined),
  showAdvanced = new ReactiveVar(false),
  showCompleted = new ReactiveVar(false),
  error = new ReactiveVar(''),
  isSubmitting = new ReactiveVar(false);

Template.addEditTask.onCreated(function () {
  showAdvanced.set(false);
  showCompleted.set(false);
  options = _.first(this.data) || {};
  if (options.taskId) {
    // Search for the task on the possible collections
    task.set(Tasks.findOne({_id: options.taskId}) || CalendarTasks.findOne({_id: options.taskId}));
    showCompleted.set(!!task.get().completed);
  } else {
    task.set(undefined);
  }

  // Set task URL when editing a task
  originalUrl = window.location.pathname;
  if (task.get()) {
    var url = '/tasks/' + task.get()._id;
    // When accessing directly to a task, the original URL should be /tasks
    if (originalUrl == url)
      originalUrl = '/tasks';

    // Replace the original URL - hack, there is a bug in replaceState/tasks/ironRoute
    setTimeout(function () {
      window.history.replaceState(null, null, url)
    }, 500);
  }
});

Template.addEditTask.helpers({
  error: function () {
    return error.get();
  },
  isSubmitting: function () {
    return isSubmitting.get();
  },
  task: function () {
    return task.get() || {msg:''};
  },
  notAddTask: function() {
    return options.taskId;
  },
  msgPlaceholder: function () {
    return TAPi18n.__('Add task here');
  },
  beginDate: function () {
    // Use either the task begin date or a new date
    return task.get() ? task.get().begin : new Date();
  },
  endDate: function () {
    // Use either the task end date or undefined
    return task.get() ? task.get().end : undefined;
  },
  users: function () {
    return _.map(Meteor.users.find({}).fetch(), function (user) {
      var displayName = Blaze._globalHelpers.displayUserName(user._id);
      return {label: displayName, value: user._id};
    })
  },
  assignedUser: function () {
    // User either the task assigned user or the first one found in the users collection
    return task.get() ? task.get().assign[0] : Meteor.users.findOne()._id;
  },
  showAdvanced: function () {
    return showAdvanced.get();
  },
  showCompleted: function () {
    return showCompleted.get();
  },
  completedDate: function () {
    // Use either the task end date or undefined
    return task.get() ? task.get().completed : undefined;
  }
});

Template.addEditTask.events({
  'click .collapsed-btn-group': function () {
    showAdvanced.set(!showAdvanced.get());
  },
  'click .isCompleted': function () {
    showCompleted.set(!showCompleted.get());
  },
  'click .archive': function () {
    setInactive(true);
  },
  'click .recover': function () {
    setInactive(false);
  },
  'click .pushOneDay': function () {
    pushDays = 1;
  },
  'click .pushOneWeek': function () {
    pushDays = 7;
  },
  'click .pushOneMonth': function () {
    pushDays = 30;
  },
  'click .save-task': function(){
    pushDays = 0;
  }
});

var setInactive = function (setValue) {
  // Clear error message
  error.set('');

  // Update task
  isSubmitting.set(true);
  var method = setValue ? 'archiveTask' : 'recoverTask';
  Meteor.call(method, task.get()._id, function (err) {
    isSubmitting.set(false);
    if (err) {
      var msg = err.reason ? err.reason : err.error;
      error.set('Server error. ' + msg);
    } else {
      Utils.dismissModal();
    }
  });
};
//var pushTask = function (days) {
//  // Clear error message
//  error.set('');
//  // Update task
//  isSubmitting.set(true);
//  Meteor.call('pushTask', task.get()._id, days, function (err) {
//    isSubmitting.set(false);
//    if (err) {
//      var msg = err.reason ? err.reason : err.error;
//      error.set('Server error. ' + msg);
//    } else {
//      Utils.dismissModal();
//    }
//  });
//};


Template.addEditTask.onDestroyed(function () {
  // Change the URL back to it's original path
  var currentUrl = window.location.pathname;
  if (originalUrl != currentUrl) {
    history.replaceState(null, 'edit', originalUrl);
  }
});


AutoForm.hooks({
  addEditTaskForm: {
    onSubmit: function (insertDoc) {
      var self = this;

      // Clean schema for auto and default values
      TaskSchema.clean(insertDoc);

      // Clear error message
      error.set('');

      // Add link parameter when provided
      insertDoc.link = options.link;

      // Insert/update task
      isSubmitting.set(true);
      if(pushDays>0){
        if(insertDoc.begin){
          insertDoc.begin.setDate(insertDoc.begin.getDate() + pushDays);
        }
        else{
          insertDoc.begin.setDate(new Date() + pushDays);
        }
      }

      if (task.get()) {
        Meteor.call('updateTask', task.get()._id, insertDoc, function (err) {
          isSubmitting.set(false);
          if (err) {
            var msg = err.reason ? err.reason : err.error;
            error.set('Server error. ' + msg);
          } else {
            self.done();
            Utils.dismissModal();
          }
        });
      } else {
        Meteor.call('addTask', insertDoc, function (err) {
          isSubmitting.set(false);
          if (err) {
            var msg = err.reason ? err.reason : err.error;
            error.set('Server error. ' + msg);
          } else {
            self.done();
            Utils.dismissModal();
          }
        });
      }

      return false;
    }
  }
});
