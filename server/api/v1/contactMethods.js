
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
        // Create new contact method
        // Body:
        //  - contactableId: string
        //  - type: string (int)
        //  - value: string
        case 'POST':
          var data = this.request.body;
          try {
            var intType = parseInt(data.type);
            ContactableManager.addContactMethod(data.contactableId, intType, data.value);
            response.end(data);
          } catch(err) {
            console.log(err);
            response.error(err.message);
          }
          break;

        default:
          response.error('Method not supported');
      }
    }
  })
});
