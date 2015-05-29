
request = Meteor.npmRequire("request");

TwApiHelper = function (account) {
  this.baseURL = ExartuConfig.TwEnterpriseAPI_URL;
  _.extend(this, account);
};

TwApiHelper.prototype.post = function (url, data, cb) {
  var options = {};

  // Set authentication headers
  options.headers = getHeaders(this);

  // Set request body data
  if (data) { options.body = JSON.stringify(data) }

  // Try to execute the post
  request.post(this.baseURL + url, options, function (err, result) {
    // Catch unauthorized error
    if (err && err.response && err.response.statusCode == 401) {
      // Assume the token is expired and login again
      var tokenInfo = twLogin(this);

      // Update headers
      options.headers = getHeaders(tokenInfo);

      request.post(this.baseURL + url, options, function (err, result) {
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
  });
};

TwApiHelper.prototype.get = function (url, cb) {
  var options = {};

  // Set authentication headers
  options.headers = getHeaders(this);

  // Try to execute the post
  request.get(this.baseURL + url, options, function (err, result) {
    // Catch unauthorized error
    if (err && err.response && err.response.statusCode == 401) {
      // Assume the token is expired and login again
      var tokenInfo = twLogin(this);

      // Update headers
      options.headers = getHeaders(tokenInfo);

      request.get(this.baseURL + url, options, function (err, result) {
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
  });
};

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
  }, function (err, response) {
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
  })
});
