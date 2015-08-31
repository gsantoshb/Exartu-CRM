WorkFlowsController = RouteController.extend({
  data: function(){
  },
  waitOn: function () {
  },
  action: function () {
    this.render('workFlowList');
  },
  onAfterAction: function() {
  }
});

var reactFinished = new ReactiveVar(true);
var reactInProgress = new ReactiveVar(true);

Template.workFlowList.created = function(){
  Meteor.autorun(function(){
    var filterOr = [];
    if(reactFinished.get()){
      filterOr.push({flow:{$not:{$elemMatch:{called:!reactFinished.get()}}}})
    }
    if(reactInProgress.get()){
      filterOr.push({flow:{$elemMatch:{called:!reactInProgress.get()}}})
    }
    if(reactFinished.get()||reactInProgress.get()) {
       SubscriptionHandlers.WorkFlowsHandler = Meteor.paginatedSubscribe('workFlows', {filter: {$or: filterOr}});
    }
    else{
      SubscriptionHandlers.WorkFlowsHandler = Meteor.paginatedSubscribe('workFlows');
    }

  })
}

Template.workFlowList.helpers({
  'totalCount': function(){
    return SubscriptionHandlers.WorkFlowsHandler.totalCount()
  },
  'workFlows': function(){
    return WorkFlows.find({}, {sort:{dateCreated:-1}});
  },
  'getFinishedClass': function(){
    if( reactFinished.get() )
       return 'btn-primary';
    else{
       return 'btn-default'
    }
  },
  'getInProgressClass': function(){
    if( reactInProgress.get() )
      return 'btn-primary';
    else{
      return 'btn-default'
    }
  }
})

Template.workFlowList.events({
  'click #inProgress': function(){
    reactInProgress.set(!reactInProgress.get())
  },
  'click #finished': function(){
    reactFinished.set(!reactFinished.get())
  }
})

Template.workFlowsListItem.helpers({
  'getWorkFlowType': function(){
    switch (this.type){
      case Enums.workFlowTypes.jobOffer:
      {
        return 'Job offer';
        break;
      }
      case Enums.workFlowTypes.placementConfirm:
      {
        return 'Confirm placement';
        break;
      }
    }
  },
  'numberCalled': function(){
    var count = 0;
    _.forEach(this.flow, function(f){
      if(f.called){
        count++;
      }
    })
    return count;
  },
  'totalToCall': function(){
    return this.flow.length;
  },
  'isFinished': function(){
    var count = 0;
    _.forEach(this.flow, function(f){
      if(f.called){
        count++;
      }
    })
    return (count === this.flow.length);
  }
})