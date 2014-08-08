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
  },
  taskClass: function(){
    return 'task-' + this.state;
  },
  getHref: function(){
    return Utils.getHrefFromLink(this);
  },
  getEntity: function(){
    return Utils.getEntityFromLink(this);
  },
  isMe: function(){
    return (Meteor.userId() == this._id) ? 'text-info' : '';
  }
})

Template.taskBox.events({
  'click .editTask': function(){
    Composer.showModal('addEditTask', this)
  },
  'click .addTask': function(){
    Composer.showModal('addEditTask', { links: [{
      id: Session.get('entityId'),
      type: entityType
    }] })
  }
})
Template.taskState.helpers({
  canComplete: function(){
    return this.state == Enums.taskState.pending && _.contains(this.assign,Meteor.userId());
  },
  getStateIcon: function(){
    return helper.getTaskStateIcon(this.state);
  }
})

Template.showTaskDate.helpers({
  statusIs: function(statusName){
    return this.state == Enums.taskState[statusName];
  }
})