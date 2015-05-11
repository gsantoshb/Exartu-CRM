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

});

Template.taskItem.events({
    'click .editTask': function (){
      Utils.showModal('addEditTask', {taskId: this._id});
    },
  'click button[data-toggle="popover"]': function (e, ctx) {
      var object = e.currentTarget;
      var attr = $(object).attr('aria-describedby');
      // destroy any other popovers open on page
      $('.popover').popover('destroy');

      if ( !(typeof attr !== typeof undefined && attr !== false) ) {
      // we set all other popovers besides this one to off so that we can open them next time
        $(object).popover('show');
      }
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

Template.taskItem.created = function () {
 $('button[data-toggle="popover"]').attr('data-init', 'off');
 $('.popover').hide().popover('destroy');
};

Template.taskItem.destroyed = function () {
  $('button[data-toggle="popover"]').attr('data-init', 'off');
  $('.popover').hide().popover('destroy');
};

Template.taskLink.helpers({
  isContactable: function(){
    return this.type === Enums.linkTypes.contactable.value;
  },
  getHref: function(){
    return Utils.getHrefFromLink(this);
  },
  getEntity: function(){
    return Utils.getEntityFromLink(this);
  },
  phone: function(){
    var contactable =  Contactables.findOne({_id: this.id});
    var phoneLookups = LookUps.find({lookUpCode: Enums.lookUpCodes.contactMethod_types, lookUpActions:{$in:[Enums.lookUpAction.ContactMethod_Phone]}}).fetch();
    var phoneLookUpsIds = _.pluck(phoneLookups,"_id" );
    var toReturn = "";
    _.each(contactable.contactMethods, function(c){
      var index = _.indexOf(phoneLookUpsIds, c.type)
      if(index > -1){
        toReturn = toReturn +"<br>"+ phoneLookups[index].displayName + "<a href='tel:"+ c.value+"' "+"style='float:right'>"+c.value+"</a>";
      }
     });
    return toReturn;
  }
})