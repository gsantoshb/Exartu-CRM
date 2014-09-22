

var isFieldValueUnique = function(fieldName, value) {
  var selector = {};
  selector[fieldName] = value;
  return Meteor.call('checkUniqueness', selector);
};

Router.map(function() {
	// Get employees
	this.route('apiAuthLogin' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/auth/login',
		action: function() {
			console.log('API v' + api_version + '/auth/login ' + this.request.method);
      console.log(this.request.body);

      this.response.setHeader("Content-Type", "application/json");
      this.response.setHeader("Access-Control-Allow-Origin", "*");
      this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

			switch(this.request.method) {
				case 'POST':
				 	var data = !_.isEmpty(this.request.body)? this.request.body : this.request.headers;
				 	try {
            var result = RESTAPI.loginAction(data);
            this.response.statusCode = 200;
            this.response.end(JSON.stringify(result));
				  } catch(err) {
				  	this.response.statusCode = err.error;
				  	this.response.end(JSON.stringify(err.reason));
				  } 
			 		
				 	break;

				default: 
					this.response.statusCode = 500;
					this.response.end();
			}
		}
	})
});

Router.map(function() {
  this.route('apiAuthRegister' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/auth/register',
    action: function() {
      console.log('API v' + api_version + '/auth/register ' + this.request.method);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        case 'POST':
          var data = this.request.body;

          try {
            if (!data.email)
              throw new Meteor.Error(500, 'Email is required');

            if (!data.password)
              throw new Meteor.Error(500, 'Password is required');

            if (!isFieldValueUnique('emails.address', data.email))
              throw new Meteor.Error(500, 'Email already in use');

            var userId = Meteor.call('registerAccount', data, true);

            var stampedLoginToken = RESTAPI.generateLoginToken(userId);

            response.end({
              userId: userId,
              loginToken: stampedLoginToken
            });
          } catch(err) {
            response.error(err);
          }

          break;
        default:
          response.error('Method not supported');
      }
    }
  })
});