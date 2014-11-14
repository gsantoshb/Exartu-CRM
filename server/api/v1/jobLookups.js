Router.map(function() {
  // Job Titles
  this.route('apiLookups_JobTitles' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/lookups/jobTitles',
    action: function() {
      console.log('API v' + api_version + '/lookups/jobTitles ' + this.request.method);

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
            var res = connection.call('getJobTitles');

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

  // Job Durations
  this.route('apiLookups_JobDurations' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/lookups/jobDurations',
    action: function() {
      console.log('API v' + api_version + '/lookups/jobDurations ' + this.request.method);

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
            var res = connection.call('getJobDurations');

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

  // Job Status
  this.route('apiLookups_JobStatus' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/lookups/jobStatus',
    action: function() {
      console.log('API v' + api_version + '/lookups/jobStatus ' + this.request.method);

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
            var res = connection.call('getJobStatus');

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
