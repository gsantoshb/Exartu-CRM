RESTAPI = {};
var selectorFromUserQuery = function (user) {
  if (user.id)
    return {_id: user.id};
  else if (user.username)
    return {username: user.username};
  else if (user.email)
    return {"emails.address": user.email};

  throw new Meteor.Error(403, "Missed information for login");
};

RESTAPI.generateLoginToken = function(userId) {
  var stampedLoginToken = Accounts._generateStampedLoginToken();
	Accounts._insertHashedLoginToken(userId, stampedLoginToken);

  return stampedLoginToken.token;
};

RESTAPI.getLoginToken = function(request) {
	return request.params.loginToken || request.request.headers["login-token"];
};

RESTAPI.loginAction = function (data) {
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

  var stampedLoginToken = RESTAPI.generateLoginToken(user._id);
   return {
     loginToken: stampedLoginToken,
     userId: user._id
   }
};

RESTAPI.getUserFromToken = function (loginToken) {
	if (!loginToken)
		throw new Meteor.Error(500, 'LoginToken is required');

	console.log('API LoginToken: ', loginToken);

	var user = Meteor.users.findOne({"services.resume.loginTokens.token": loginToken}) 
	if (!user)
		throw new Meteor.Error(500, 'Invalid access token');

	return user;
};

// Connection

RESTAPI.connection = function(user) {
	var self = this;

	self.userId = user._id;
	self.connection = DDP.connect(Meteor.absoluteUrl());
	self.connection.setUserId(user._id);
};

RESTAPI.connection.prototype.call = function(method, params) {
	var self = this;
	return self.connection.call('apiCallWrapper', self.userId, method, params)
};

Meteor.methods({
	'apiCallWrapper': function(userId, method) {
		var params = _.rest(_.values(arguments), 1);
		this.setUserId(userId);
		if (_.isFunction(method))
			return method.apply({}, params);
		else
			return Meteor.call.apply({}, _.union(method, params));
	}
})

// Response

RESTAPI.response = function(httpResponse) {
	var self = this;
	self.response = httpResponse;
};

RESTAPI.response.prototype.end = function(message, options) {
	var self = this;

	var code = 200;
	if (options) {
		code = options.code || code;
		// Content-type
		switch(options.type) {
			case 'json': self.response.setHeader("Content-Type", "application/json"); break;
			default: 
		}
	}
	else {
		self.response.setHeader("Content-Type", "text/plain");
	}

	self.response.statusCode = code;
	self.response.end(JSON.stringify(message));
};

RESTAPI.response.prototype.error = function(err) {
	var self = this;

	if (_.isString(err)) {
		self.response.statusCode = 500;
		self.response.end(JSON.stringify(err));	
	} else {
		self.response.statusCode = err.error || 500;
		self.response.end(JSON.stringify(err.reason || (err.TypeError || '')));
	}

	throw new Meteor.Error(500, err);
};