
Router.map(function() {
  this.route('apiJobs' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/jobs/',
    action: function() {
      console.log('API v' + api_version + '/jobs ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        // Get jobs by customer ID
        // Parameters:
        //  - customerId: string
        case 'GET':
          var customerId = this.params.customerId;
          try {
            var res = connection.call('getJobs', customerId);

            // Transform the response before sending it back
            res = mapper.get(res);
            response.end(res);
          } catch(err) {
            console.log(err);
            response.error(err.message);
          }
          break;


        // Add a new job for a customer
        // Body:
        //  - customerId: string
        //  - jobTitleId: string
        //  - startDate: string (date)
        //  - endDate: string (date) ?
        //  - durationId: string ?
        //  - statusId: string ?
        case 'POST':
          var data = this.request.body;
          try {
            var jobInfo = mapper.create(data);
            var jobId = connection.call('addJob', jobInfo);
            _.extend(data, {id: jobId});
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
      customer: data.customerId,
      jobTitle: data.jobTitleId,
      startDate: new Date(data.startDate),
      objNameArray: ["Temporary", "job"]
    };

    if (data.endDate) { res.endDate = new Date(data.endDate); }
    if (data.durationId) { res.duration = data.durationId; }
    if (data.statusId) { res.status = data.statusId; }

    //ExternalId
    if (data.externalId){
      res.externalId = data.externalId;
    }
    return res;
  },
  get: function(data, customerId) {
    if (!data) return {};

    var result = [];
    _.each(data, function (item) {
      var res = {
        id: item._id,
        customerId: item.customer,
        jobTitleId: item.jobTitle,
        startDate: item.startDate
      };

      if (item.endDate) { res.endDate = item.endDate; }
      if (item.duration) { res.durationId = item.duration; }
      if (item.status) { res.statusId = item.status; }

      //ExternalId
      if (item.externalId){
        res.externalId = item.externalId;
      }

      result.push(res);
    });

    return result;
  }
};
