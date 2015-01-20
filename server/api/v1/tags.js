Router.map(function() {
  this.route('tags' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/tags',
    action: function() {
      console.log('API v' + api_version + '/tags ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        // Get tags for a contactable by ID
        // Parameters:
        //  - contactableId: string
        case 'GET':
          var contactableId = this.params.query.contactableId;
          try {
            var res = connection.call('apiGetTags', contactableId);
            response.end(res);
          } catch(err) {
            console.log(err);
            response.error(err.message);
          }
          break;

        // Add a new tag for a contactable
        // Body:
        //  - contactableId: string
        //  - tag: string
        //  - externalId: string ?
        case 'POST':
          var data = this.request.bodyFields;

          try {
            var tag = mapper.create(data);
            connection.call('apiAddTag', tag);
            response.end(data);
          } catch(err) {
            console.log(err);
            response.error(err);
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
    var tag = {
      contactableId: data.contactableId,
      tag: data.tag
    };

    // Optional values
    if (data.externalId) { tag.externalId = data.externalId; }

    return tag;
  }
};