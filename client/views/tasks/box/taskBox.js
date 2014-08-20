var entityType=null;
Template.taskBox.created=function(){
  entityType=Utils.getEntityTypeFromRouter();
}

Template.taskBox.helpers({
  taskCount: function(){
    return Tasks.find({ links: { $elemMatch: { id: Session.get('entityId') } } }).count();
  },
  tasks: function(){
    return Tasks.find({ links: { $elemMatch: { id: Session.get('entityId') } } }, { sort: { dateCreated: -1 } });
  }
})

Template.taskBox.events({
  'click .addTask': function(){
    Composer.showModal('addEditTask', { links: [{
      id: Session.get('entityId'),
      type: entityType
    }] })
  }
})
