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
  'isCanceled': function(){
    return this.status === 'canceled';
  },
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
    else if(this.response === "Confirmed"){
      return "label-success";
    }
    else if(this.response === "NoConfirmed"){
      return "label-danger";
    }
    else if(this.response === "Canceled"){
      return "label-danger";
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
    else if(this.response === "Confirmed"){
      return "Confirmed";
    }
    else if(this.response === "NoConfirmed"){
      return "Not confirmed";
    }
    else if(this.response === "Canceled"){
      return "Canceled";
    }
  }

})

Template.workFlowDetails.events({
  'click #cancel-workflow': function(){
    Meteor.call('cancelWorkFlow', this._id, function(err, res){

    });
  }
})
