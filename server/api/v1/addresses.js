
Router.map(function() {
  this.route('apiAddresses' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/addresses/',
    action: function() {
      console.log('API v' + api_version + '/addresses ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        // Get address by contactable ID
        // Parameters:
        //  - contactableId: string
        case 'GET':
          var contactableId = this.params.contactableId;
          try {
            var res = ContactableManager.getContactMethodsForApi(contactableId);
            response.end(res);
          } catch(err) {
            console.log(err);
            response.error(err.message);
          }
          break;


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
