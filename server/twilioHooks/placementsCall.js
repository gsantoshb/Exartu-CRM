

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
        console.log(err);
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

