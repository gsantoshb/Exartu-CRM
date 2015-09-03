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
var entityId;
var entityType;
var reactFinished = new ReactiveVar(true);
var reactInProgress = new ReactiveVar(true);
var reactCanceled = new ReactiveVar(true);

Template.workFlowListBox.created = function(){
  entityId = Session.get('entityId');
  entityType = Utils.getEntityTypeFromRouter();
  console.log("entityId", entityId);
  console.log("entityType", entityType);

  Meteor.autorun(function(){
    var filterOr = [];
    var filterJob = {};
    if(reactFinished.get()){
      //get all workflow that have each element of flow called and status isn't canceled
      filterOr.push({$and:[{flow:{$not:{$elemMatch:{called:!reactFinished.get()}}}},{status:{$ne:'canceled'}}]})
    }
    if(reactInProgress.get()){
      filterOr.push({$and:[{flow:{$elemMatch:{called:!reactInProgress.get()}}},{status:{$ne:'canceled'}}]})
    }
    if(reactCanceled.get()){
      filterOr.push({status:'canceled'})
    }
    if(entityType === Enums.linkTypes.job.value){
      filterJob = {jobId: entityId};
      if(reactFinished.get()||reactInProgress.get()||reactCanceled.get()) {
        SubscriptionHandlers.WorkFlowsHandler = Meteor.paginatedSubscribe('workFlows', {filter: {$and:[{$or: filterOr},filterJob]}});
      }
      else{
        SubscriptionHandlers.WorkFlowsHandler = Meteor.paginatedSubscribe('workFlows', {filter:filterJob});
      }

    }
    else {
      if (reactFinished.get() || reactInProgress.get() || reactCanceled.get()) {
        SubscriptionHandlers.WorkFlowsHandler = Meteor.paginatedSubscribe('workFlows', {filter: {$or: filterOr}});
      }
      else {
        SubscriptionHandlers.WorkFlowsHandler = Meteor.paginatedSubscribe('workFlows');
      }
    }

  })
}

Template.workFlowListBox.helpers({
  'entityId': function(){
    return entityId;
  },
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
  },
  'getCanceledClass': function(){
    if( reactCanceled.get() )
      return 'btn-primary';
    else{
      return 'btn-default'
    }
  },
  'showAdd': function() {
    if (entityType === Enums.linkTypes.job.value){
      return true;
    }
    else{
      return false;
    }
  }
})

Template.workFlowListBox.events({
  'click #inProgress': function(){
    reactInProgress.set(!reactInProgress.get())
  },
  'click #finished': function(){
    reactFinished.set(!reactFinished.get())
  },
  'click #canceled': function(){
    reactCanceled.set(!reactCanceled.get())
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
  },
  'isCanceled': function(){
    return this.status === 'canceled';
  }
})