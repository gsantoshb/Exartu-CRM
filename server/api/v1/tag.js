Router.map(function() {
  this.route('tags' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/tags',
    action: function() {
      console.log('API v' + api_version + '/tags ' + this.request.method);


      var udata = {};

      // Get login token from request
      var loginToken = udata.loginToken || RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = udata.userId ? Meteor.users.findOne(udata.userId) : RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        case 'GET':
          if (this.params.contactableId) {
            var contactable = Contactables.findOne({_id: this.params.contactableId, hierId: user.hierId});
            response.end(contactable && contactable.tags, {type: 'application/json'});
          }
          else
            response.error('contactableId is required');
          break;

        // Crete new contactable
        // Body:
        //   - tag: string
        // 	 - contactableId: string
        case 'POST':
          var data = this.request.body || {};

          if (! data.contactableId) {
            response.error('argument contactableId is required');
          }
          if (! data.tag || !_.isString(data.tag) || _.isEmpty(data.tag)) {
            response.error('tag must be a non-empty string');
          }

          var contactableExists = Contactables.findOne(data.contactableId);
          if (! contactableExists) {
            response.error('contactable not found');
          }
          try {
            Contactables.update(data.contactableId, { $addToSet: {tags: data.tag}});
            response.end('OK');
          } catch(err) {
            console.log(err)
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