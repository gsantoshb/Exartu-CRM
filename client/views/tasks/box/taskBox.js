var entityType=null;
Template.taskBox.created=function(){
  switch (Router.current().route.name){
    case 'contactable':
      entityType= Enums.linkTypes.contactable.value;
      break;
    case 'job':
      entityType= Enums.linkTypes.job.value;
      break;
  }
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
