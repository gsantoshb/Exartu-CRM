Template.newContactableActivity.getActivityColor = function(){
  return helper.getActivityColor(this);
};

Template.newContactableActivity.getActivityIcon = function(){
  return helper.getActivityIcon(this);
};

Template.newNoteActivity.helpers({
  note: function () {
    return Notes.findOne(this.entityId);
  }
});

Template.contactableUpdateActivity.helpers({
  isListChange: function () {
    return this.data.added || this.data.removed || this.data.changed;
  }
});

Template.newTaskActivity.helpers({
  task: function () {
    return Tasks.findOne(this.entityId);
  }
});

Template.newPlacementActivity.helpers({
  job: function () {
    return Jobs.findOne(this.data.job);
  }
});

Template.newFileActivity.helpers({
  file: function () {
    return ContactablesFiles.findOne(this.entityId);
  }
});
