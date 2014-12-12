
Router.map(function() {
  this.route('apiContactMethods' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/contactMethods/',
    action: function() {
      console.log('API v' + api_version + '/contactMethods ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        // Get contact methods by contactable ID
        // Parameters:
        //  - contactableId: string
        case 'GET':
          var contactableId = this.params.contactableId;
          try {
            var res = connection.call('getContactMethods', contactableId);

            // Transform the response before sending it back
            res = mapper.get(res, contactableId);
            response.end(res);
          } catch(err) {
            console.log(err);
            response.error(err.message);
          }
          break;

        // Create new contact method
        // Body:
        //  - contactableId: string
        //  - type: string (Id)
        //  - value: string
        case 'POST':
          var data = this.request.body;
          try {
            connection.call('addContactMethod', data.contactableId, data.type, data.value);
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
  get: function(data, contactableId) {
    if (!data) return {};

    var result = [];
    _.each(data, function (item) {
      var res = {
        contactableId: contactableId,
        type: item.type,
        value: item.value
      };

      result.push(res);
    });

    return result;
  }
};
