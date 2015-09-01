WorkFlowManager = {
    insertWorkFlow: function(userId, workFlow){
      var job = Jobs.findOne({_id: workFlow.jobId});
      if(job.address) {
        var hier = Hierarchies.findOne({_id:Meteor.user().hierId})
        if(hier.phoneNumber) {
          var toReturn = WorkFlows.insert(workFlow);
          _.defer(Meteor.bindEnvironment(function () {
            if(workFlow.type === Enums.workFlowTypes.jobOffer){
              WorkFlowManager.makeCalls(userId, toReturn)
            }
            else{
              WorkFlowManager.makeCallsPlacementConfirm(userId, toReturn);
            }

          }));
          return toReturn;
        }
        else{
          throw new Error('Error, hierarchy has no number assigned');
        }
      }
      else{
        throw new Error("Error, job has no address");
      }
  },
  makeCallsPlacementConfirm: function(userId, workFlowId){
    TwilioManager.makeWorkFlowCallPlacementConfirm(userId,workFlowId);
  },
  makeCalls: function(userId, workFlowId){
    TwilioManager.makeWorkFlowCall(userId,workFlowId);
  },
  setWorkFlowCall: function(workFlowId, placementId,response){
    var workFlow = WorkFlows.findOne({_id: workFlowId});
    _.each(workFlow.flow, function(f){
      if(f.placementId === placementId){
        f.response = response;
        f.called = true;
      }
    })
    WorkFlows.update({_id: workFlowId}, {$set:workFlow});
  },
  getWorkFlowResponse: function(workFlowId, placementId){
    var toReturn;
    var workFlow = WorkFlows.findOne({_id:workFlowId});
    _.each(workFlow.flow, function(f){
      if(f.placementId === placementId){
        toReturn = f.response;
      }
    })
    return toReturn;
  },
  resumeInProgress: function(){
    WorkFlows.find().forEach(function(w){
      var revertAnswerStatus = false;
      var finished = true;
      var flowArray = [];
      if(w.status !== 'canceled'){
      _.each(w.flow, function(f){
         if(f.response === "Answered"){
           f.response = undefined;
           f.called = false;
           revertAnswerStatus = true;
         }
         flowArray.push(f);
         finished = f.called && finished;
      })
      if(revertAnswerStatus){
        WorkFlows.update({_id: w._id}, {$set:{flow:flowArray}})
      }

      if(!finished){
        if(w.type === Enums.workFlowTypes.jobOffer) {
          WorkFlowManager.makeCalls(w.userId, w._id);
        }
        else if(w.type === Enums.workFlowTypes.placementConfirm){
          WorkFlowManager.makeCallsPlacementConfirm(w.userId, w._id);

        }
      }
      }
    })

  },
  cancelWorkFlow: function(workFlowId){
    WorkFlows.update({_id: workFlowId},{$set:{status: "canceled"}});
  }
}