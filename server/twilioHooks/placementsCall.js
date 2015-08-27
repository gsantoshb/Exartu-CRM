

Router.map(function() {
  this.route('twilioPlacementCall' + api_version, {
    where: 'server',
    path: '/twilio/placementCall',
    action: function() {
      var response = new RESTAPI.response(this.response);

      // Obtain data from the respective method executed
      var data;
      switch (this.request.method) {
        case 'GET':
          data = this.params.query;
          break;

        case 'POST':
          data = this.request.body;
          break;

        default:
          response.error('Method not supported');
      }

      try {
        // Respond to twilio
        var resp = TwilioManager.handlePlacementCall(this.request.query.id, data);
        response.end(resp.toString(), {type: 'xml', plain: true});
      } catch (err) {
        response.error(err.message);
      }
    }
  })
});

Router.map(function() {
  this.route('twilioGatherPlacementResponse' + api_version, {
    where: 'server',
    path: '/twilio/gatherPlacementResponse',
    action: function() {
      var response = new RESTAPI.response(this.response);

      // Obtain data from the respective method executed
      var data;
      switch (this.request.method) {
        case 'GET':
          data = this.params.query;
          break;

        case 'POST':
          data = this.request.body;
          break;

        default:
          response.error('Method not supported');
      }

      try {
        // Respond to twilio
        var resp = TwilioManager.gatherPlacementResponse(this.request.query.id, data);
        response.end(resp.toString(), {type: 'xml', plain: true});
      } catch (err) {
        console.log(err);
        response.error(err.message);
      }
    }
  })
});

//var callUrl = "http://19831b3f.ngrok.com/" + "twilio/workFlow?id="+workFlowId+"&placementId=" + placement.placementId;
Router.map(function() {
  this.route('twilioWorkFlow' + api_version, {
    where: 'server',
    path: '/twilio/workFlow',
    action: function() {
      var response = new RESTAPI.response(this.response);

      // Obtain data from the respective method executed
      var data;
      switch (this.request.method) {
        case 'GET':
          data = this.params.query;
          break;

        case 'POST':
          data = this.request.body;
          break;

        default:
          response.error('Method not supported');
      }

      try {
        // Respond to twilio
        var resp = TwilioManager.handleWorkFlowCall(this.request.query.userId, this.request.query.id, this.request.query.placementId, data);
        WorkFlowManager.setWorkFlowCall(this.request.query.id, this.request.query.placementId, 'Answered');
        response.end(resp.toString(), {type: 'xml', plain: true});
      } catch (err) {
        console.log(err);
        response.error(err.message);
      }
    }
  })
});

Router.map(function() {
  this.route('gatherWorkFlowResponse' + api_version, {
    where: 'server',
    path: '/twilio/gatherWorkFlowResponse',
    action: function() {
      var response = new RESTAPI.response(this.response);

      // Obtain data from the respective method executed
      var data;
      switch (this.request.method) {
        case 'GET':
          data = this.params.query;
          break;

        case 'POST':
          data = this.request.body;

          break;

        default:
          response.error('Method not supported');
      }

      try {
        // Respond to twilio
        var resp;
        if(data.Digits === '1') {
          resp = TwilioManager.gatherWorkFlowResponseTrue(this.request.query.id, this.request.query.placementId, data);
          WorkFlowManager.setWorkFlowCall(this.request.query.id, this.request.query.placementId, 'Intrested');
        }
        else{
          resp = TwilioManager.gatherWorkFlowResponseFalse(this.request.query.id, this.request.query.placementId, data);
          WorkFlowManager.setWorkFlowCall(this.request.query.id, this.request.query.placementId, 'NotIntrested');

        }
        response.end(resp.toString(), {type: 'xml', plain: true});
        TwilioManager.makeWorkFlowCall(this.request.query.userId, this.request.query.id);
      } catch (err) {
        console.log(err);
        response.error(err.message);
      }
    }
  })
});


Router.map(function() {
  this.route("callback" + api_version, {
    where: 'server',
    path: "/twilio/callback",
    action: function() {
      var response = new RESTAPI.response(this.response);
      var callStatus;
      // Obtain data from the respective method executed
      var data;
      switch (this.request.method) {
        case 'GET':
          callStatus = this.request.body.CallStatus;
          data = this.request;
          //data = this.params.query;
          break;

        case 'POST':
          callStatus = this.request.body.CallStatus;
          data = this.request;
          //data = this.request.body;
          break;

        default:
          response.error('Method not supported');
      }

      try {
        var res = WorkFlowManager.getWorkFlowResponse( this.request.query.id, this.request.query.placementId);
        if((res === 'Intrested')||(res === 'NotIntrested')){
            //nothing to do here
        }
        else{
           switch(callStatus){
             case 'completed':{
               var res = WorkFlowManager.getWorkFlowResponse( this.request.query.id, this.request.query.placementId);
               if(res === 'Answered') {
                 WorkFlowManager.setWorkFlowCall(data.query.id, data.query.placementId, 'NotIntrested');
               }
               else{
                 WorkFlowManager.setWorkFlowCall(data.query.id, data.query.placementId, 'NoAnswer');
               }
               TwilioManager.makeWorkFlowCall(data.query.userId, data.query.id);
               break;
             }
             case 'no-answer':{
               WorkFlowManager.setWorkFlowCall(data.query.id, data.query.placementId, 'NoAnswer');
               TwilioManager.makeWorkFlowCall(data.query.userId, data.query.id);
             }
           }
        }
      } catch (err) {
        console.log(err);
        response.error(err.message);
      }
    }
  })
});

