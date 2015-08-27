var workflowId;
workFlowDetailController = RouteController.extend({
  data: function(){
  },
  waitOn: function () {
  },
  action: function () {
    this.render('workFlowDetails');
    workflowId = Router.current().params.id;
    Meteor.subscribe('singleWorkFlow', workflowId);
    //debugger;
  },
  onAfterAction: function() {
  }
});

Template.workFlowDetails.helpers({
  'workFlow': function(){
     return WorkFlows.findOne({_id:workflowId})
  },
  'getColor': function(){
    if(this.called){
      return "green"
    }
    else{
      return "gray"
    }
  },
  'getResponseClass': function(){
    if(this.response === "NotIntrested"){
      return "label-danger";
    }
    else if(this.response === "Answered"){
      return "label-primary";
    }
    else if(this.response === "NoAnswer"){
      return "label-warning";
    }
    else if(this.response === "Intrested"){
      return "label-success";
    }
  },
  'getResponse': function(){
    if(this.response === "NotIntrested"){
      return "Not intrested";
    }
    else if(this.response === "Answered"){
      return "Answered";
    }
    else if(this.response === "NoAnswer"){
      return "No answer";
    }
    else if(this.response === "Intrested"){
      return "Intrested";
    }
  }

})
