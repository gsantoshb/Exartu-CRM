
Router.map(function() {
  this.route('hrckiosk' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/hrckiosk/:hierId/:meteorUserId',
    action: function() {
      console.log('API v' + api_version + '/hrckiosk ' + this.request.method);

      var response = new RESTAPI.response(this.response);

      var meteorUserId = this.params.meteorUserId;
      var user = Meteor.users.findOne(meteorUserId);
      if(!user) {
        response.error("Hierarchy user not found");
        return;
      }

      var connection = new RESTAPI.connection(user);

      switch(this.request.method) {
        // Body:
        //  - docCenterId: string
        case 'POST':
          var hierId = this.params.hierId;


          if (!this.request.bodyFields.userId) {
            response.error("Parameter userId is required");
            return;
          }

          try {
            var res = connection.call('syncKioskEmployee', hierId, this.request.bodyFields.userId);
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
  })
});
