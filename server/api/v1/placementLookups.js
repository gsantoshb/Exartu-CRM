Router.map(function() {
  // Placement Statuses
  this.route('apiLookups_PlacementsStatus' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/lookups/placementStatus',
    action: function() {
      console.log('API v' + api_version + '/lookups/placementStatus ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        case 'GET':
          try {
            var res = connection.call('getPlacementStatus');

            // Transform the response before sending it back
            res = mapper.get(res);
            response.end(res);
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
  });

  // Candidate Status
  this.route('apiLookups_CandidateStatus' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/lookups/candidateStatus',
    action: function() {
      console.log('API v' + api_version + '/lookups/candidateStatus ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        case 'GET':
          try {
            var res = connection.call('getCandidateStatus');

            // Transform the response before sending it back
            res = mapper.get(res);
            response.end(res);
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
  });

  // Placement Rates
  this.route('apiLookups_PlacementRates' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/lookups/placementRates',
    action: function() {
      console.log('API v' + api_version + '/lookups/placementRates ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        case 'GET':
          try {
            var res = connection.call('getPlacementRateTypes');

            // Transform the response before sending it back
            res = mapper.get(res);
            response.end(res);
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
  });

});


var mapper = {
  get: function(data) {
    if (!data) return {};

    var result = [];
    _.each(data, function (item) {
      var res = {
        id: item._id,
        displayName: item.displayName
      };
      if (item.lookUpActions) {
        res.lookUpActions = item.lookUpActions;
      }

      result.push(res);
    });

    return result;
  }
};


