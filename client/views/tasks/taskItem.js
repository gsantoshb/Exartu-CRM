Template.taskItem.helpers({
    taskClass: function(){
        return 'task-' + this.state + (this.inactive ? ' inactive' : '');
    },
    isMe: function(){
        return (Meteor.userId() == this._id) ? 'text-info' : '';
    },
    statusIs: function(statusName){
        return this.state == Enums.taskState[statusName];
    },
    hasLinks: function() {
        return this.links.length;
    },
    getHref: function(){
        return Utils.getHrefFromLink(this);
    },
    getEntity: function(){
        return Utils.getEntityFromLink(this);
    }
});

Template.taskItem.events({
    'click .editTask': function (){
      Utils.showModal('addEditTask', this)


    }
});

Template.taskLabel.helpers({
    statusIs: function(statusName){
        return this.state == Enums.taskState[statusName];
    },
    getStatus: function(){
        var keys = Object.keys(Enums.taskState);
        var state = this.state;

        for (var i = 0; i < keys.length; i++) {
            if(Enums.taskState[keys[i]] == state)
                return keys[i];
        }
    },
    canComplete: function(){
        return this.state == Enums.taskState.pending && _.contains(this.assign,Meteor.userId());
    },
    getStateIcon: function(){
        return helper.getTaskStateIcon(this.state);
    }
});

Template.showTaskDate.helpers({
    statusIs: function(statusName){
        return this.state == Enums.taskState[statusName];
    }
});