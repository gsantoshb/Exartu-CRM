Meteor.methods({
  insertWorkFlow: function(workFlow){
    return WorkFlowManager.insertWorkFlow(Meteor.userId(), workFlow);
  }
})