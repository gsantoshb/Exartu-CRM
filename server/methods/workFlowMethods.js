Meteor.methods({
  insertWorkFlow: function(workFlow){
    try{
      return WorkFlowManager.insertWorkFlow(Meteor.userId(), workFlow);
    }
    catch(err){
      console.log('err',err);
      throw new Meteor.Error(err.message);
    }
  },
  cancelWorkFlow: function(workFlowId){
    try{
      return WorkFlowManager.cancelWorkFlow(workFlowId);
    }
    catch(err){
      console.log('err',err);
      throw new Meteor.Error(err.message);
    }
  }
})