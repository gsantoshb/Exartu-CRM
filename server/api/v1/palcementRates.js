
Router.map(function() {
  this.route('apiPlacementRates' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/placementRates/',
    action: function() {
      console.log('API v' + api_version + '/placementRates ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        // Get placement rates by placement ID
        // Parameters:
        //  - placementId: string
        case 'GET':
          var placementId = this.params.query.placementId;
          try {
            var res = connection.call('getPlacementRates', placementId);

            // Transform the response before sending it back
            res = mapper.get(res, placementId);
            response.end(res);
          } catch(err) {
            console.log(err);
            response.error(err.message);
          }
          break;


        // Add a new rate for a placement
        // Body:
        //  - placementId: string
        //  - rateId: string
        //  - bill: string (number)
        //  - pay: string (number)
        case 'POST':
          var data = this.request.bodyFields;
          try {
            var rateInfo = mapper.create(data);
            connection.call('addPlacementRate', rateInfo);
            response.end(data);
          } catch(err) {
            console.log(err);
            response.error(err.message);
          }
          break;

        default:
          response.error('Method not supported');
      }

      connection.close();
    }
  })
});


var mapper = {
  create: function(data) {
    var res = {
      placementId: data.placementId,
      type: data.rateId,
      bill: data.bill,
      pay: data.pay
    };
    return res;
  },
  get: function(data, placementId) {
    if (!data) return {};

    var result = [];
    _.each(data, function (item) {
      var res = {
        placementId: placementId,
        rateId: item.type,
        bill: item.bill,
        pay: item.pay
      };

      result.push(res);
    });

    return result;
  }
};
