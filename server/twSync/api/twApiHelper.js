
request = Meteor.npmRequire("request");

TwApiHelper = function (account) {
  this.baseURL = ExartuConfig.TwEnterpriseAPI_URL;
  _.extend(this, account);
};

TwApiHelper.prototype.post = Meteor.wrapAsync(function (url, data, cb) {
  var self = this,
      options = {};

  // Set authentication headers
  options.headers = getHeaders(self);

  // Set request body data
  if (data) { options.body = JSON.stringify(data) }

  // Try to execute the post
  request.post(self.baseURL + url, options, Meteor.bindEnvironment(function (err, result) {
    // Catch unauthorized error
    if (err && err.response && err.response.statusCode == 401 || result.statusCode == 401) {
      // Assume the token is expired and login again
      var tokenInfo = twLogin(self);

      // Update headers
      options.headers = getHeaders(tokenInfo);

      request.post(self.baseURL + url, options, Meteor.bindEnvironment(function (err, result) {
        if (err) {
          console.err('>> Tw Sync failed again... quiting');
          cb(err);
        } else {
          cb(null, JSON.parse(result.body));
        }
      }));
    } else {
      cb(null, JSON.parse(result.body));
    }
  }));
});

TwApiHelper.prototype.get = Meteor.wrapAsync(function (url, cb) {
  var self = this,
      options = {};

  // Set authentication headers
  options.headers = getHeaders(self);

  // Try to execute the post
  request.get(self.baseURL + url, options, Meteor.bindEnvironment(function (err, result) {
    // Catch unauthorized error
    if (err && err.response && err.response.statusCode == 401) {
      // Assume the token is expired and login again
      var tokenInfo = twLogin(self);

      // Update headers
      options.headers = getHeaders(tokenInfo);

      request.get(self.baseURL + url, options, function (err, result) {
        if (err) {
          console.err('>> Tw Sync failed again... quiting');
          cb(err);
        } else {
          cb(null, JSON.parse(result.body));
        }
      });
    } else {
      cb(null, JSON.parse(result.body));
    }
  }));
});

TwApiHelper.prototype.login = function () {
  return twLogin(this);
};


var getHeaders = function (accountInfo) {
  var authString = accountInfo.accessToken ? accountInfo.tokenType + ' ' + accountInfo.accessToken : undefined;

  // If there is no token yet, get one
  if (!authString) {
    var authorizationData = twLogin(accountInfo);
    authString = authorizationData.tokenType + ' ' + authorizationData.accessToken;
  }

  return { Authorization: authString, 'Content-Type': 'application/json' };
};

var twLogin = Meteor.wrapAsync(function (accountInfo, cb) {
  // Validate account information
  if (!accountInfo.username || !accountInfo.password)
    cb(new Error('Enterprise login credentials are required.'), null);

  var data = {
    grant_type: 'password',
    username: accountInfo.username,
    password: accountInfo.password,
    scope: 'SR',
    client_id: 'Tworks-dev'
  };

  HTTP.post(ExartuConfig.TwEnterpriseAPI_URL + '/Oauth/Token', {
    params: data,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, Meteor.bindEnvironment(function (err, response) {
    if (err) {
      cb(new Error('Enterprise login error.', err), null);
    } else {
      if (accountInfo.hierId) {
        Hierarchies.update({_id: accountInfo.hierId}, {
          $set: {
            'enterpriseAccount.accessToken': response.data.access_token,
            'enterpriseAccount.tokenType': response.data.token_type,
            'enterpriseAccount.expiresIn': response.data.expires_in,
            'enterpriseAccount.refreshToken': response.data.refresh_token
          }
        });
      }

      cb(null, {
        accessToken: response.data.access_token,
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in,
        refreshToken: response.data.refresh_token
      });
    }
  }));
});
