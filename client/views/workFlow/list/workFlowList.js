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

Template.workFlowList.created = function(){
  SubscriptionHandlers.WorkFlowsHandler = Meteor.paginatedSubscribe('workFlows',{});
}

Template.workFlowList.helpers({
  'workFlows': function(){
    return WorkFlows.find({}, {sort:{dateCreated:-1}});
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