Template.taskItem.helpers({
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
Template.taskItem.events({
  'click .editTask': function () {
    Composer.showModal('addEditTask', this)
  }
});
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