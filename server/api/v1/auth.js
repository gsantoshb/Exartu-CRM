var selectorFromUserQuery = function (user) {
  if (user.id)
    return {_id: user.id};
  else if (user.username)
    return {username: user.username};
  else if (user.email)
    return {"emails.address": user.email};

  throw new Meteor.Error(403, "Missed information for login");
};

var isFieldValueUnique = function(fieldName, value) {
  var selector = {};
  selector[fieldName] = value;
  return Meteor.call('checkUniqueness', selector);
};

var generateLoginToken = function(userId) {
  var stampedLoginToken = Accounts._generateStampedLoginToken();
  Meteor.users.update(userId, {
    $push: {'services.resume.loginTokens': stampedLoginToken}
  });

  return stampedLoginToken.token;
};

Router.map(function() {
	// Get employees
	this.route('apiAuthLogin' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/auth/login',
		action: function() {
			console.log('API v' + api_version + '/auth/login ' + this.request.method);

      this.response.setHeader("Content-Type", "application/json");
      this.response.setHeader("Access-Control-Allow-Origin", "*");
      this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

			switch(this.request.method) {
				case 'POST':
				 	var data = !_.isEmpty(this.request.body)? this.request.body : this.request.headers;
				 	try {
					 	if (!data.password)
							throw new Meteor.Error(403, 'Password required for login');

					 	var selector = selectorFromUserQuery(data);
					 	var user = Meteor.users.findOne(selector);

					 	if (!user)
				 			throw new Meteor.Error(403, "There is something wrong with the username or password");

				 	 	if (!user.services || !user.services.password)
				    	throw new Meteor.Error(403, "User has no password set");

					  if (!user.services.password.srp) {
					  	console.log('Checking password');
					    var resultOfInvocation = Accounts._checkPassword(user, data.password);

					    if (resultOfInvocation.error)
					      throw new Meteor.Error(403, "There is something wrong with the username or password");
					  }
					  else {
					    var verifier = user.services.password.srp;
					    var newVerifier = SRP.generateVerifier(data.password, {
					      identity: verifier.identity,
					      salt: verifier.salt
					    });

					    if (verifier.verifier !== newVerifier.verifier)
					      throw new Meteor.Error(403, "There is something wrong with the username or password");
					  }

            var stampedLoginToken = generateLoginToken(user._id);

					  this.response.statusCode = 200;
				 		this.response.end(JSON.stringify({loginToken: stampedLoginToken, userId: user._id}));
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
            if (!data.username || !data.email)
              throw new Meteor.Error(500, 'Email and username are required');

            if (!data.password)
              throw new Meteor.Error(500, 'Password is required');

            if (!isFieldValueUnique('username', data.username))
              throw new Meteor.Error(500, 'Username already in use');

            if (!isFieldValueUnique('emails.address', data.email))
              throw new Meteor.Error(500, 'Email already in use');

            var userId = Meteor.call('registerAccount', data, true);

            var stampedLoginToken = generateLoginToken(userId);

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