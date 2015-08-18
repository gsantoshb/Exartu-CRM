Meteor.methods({
  insertWorkFlow: function(workFlow){
    WorkFlowManager.insertWorkFlow(workFlow);
  }
})