Accounts = new Meteor.Collection('docCenterAccounts');
fs = Npm.require('fs') ;
path = Npm.require('path') ;
Future = Npm.require("fibers/future");
request = Npm.require("request");

_.extend(DocCenter,{
  _authkey: 'Tw04ksHr5',
  _docCenterUrl: 'http://hrconcourseapi.aidacreative.com',

  login: Meteor.wrapAsync(function (hierId, cb) {
    var account = getAccount(hierId);

    var data = {
      grant_type: 'password',
      username : account.userName,
      password : account.password
    };

    console.log('\n\nlogin ' + data.username);
    HTTP.post(this._docCenterUrl + '/token', {
      params: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, function (err, response) {
      if (err){
        console.error('login error');
        cb(err);
      }else{
        console.log('login success\n');
        Accounts.update(hierId, {
          $set: {
            accessToken : response.data.access_token,
            expiresIn : response.data.expires_in,
            type : response.data.token_type,
            createdAt: new Date()
          }
        });
        cb(null, null);
      }
    })
  }),
  
  register: Meteor.wrapAsync(function (userName, email, hierId, cb) {
    var self = this;

    //generate a docCenter user
    var docCenterUser = {
      userName: userName,
      email: email,
      password: generatePassword(),
      hier: hierId + '_' + Random.id(),
      authkey: self._authkey
    };



    var tryRegister = function (intent, originalUsername) {

      intent = _.isNumber(intent) ? intent : 0;

      if (intent > 1){
        docCenterUser.userName = originalUsername + '_' + Random.id(3);
      }

      console.log('docCenterUser.Hier', docCenterUser.hier);
      console.log('\n\nregister ' + docCenterUser.userName);

      HTTP.post(self._docCenterUrl + '/api/Account', { data: docCenterUser, headers: {'accept': '*/*', 'content-type': 'application/json'}}, function (err, response) {

        console.log('err', err);
        if (err){
          //try with a different username
          if (intent >= 3){
            console.error('Max numbers of retries in register to docCenter');
            cb(err);
          }else{
            console.log('register failed, retrying....');
            tryRegister(++intent, originalUsername);
          }
        }else {
          //console.log('err');
          console.log('register success\n');
          Accounts.insert({
            _id: hierId,
            userName: docCenterUser.userName,
            password: docCenterUser.password, //todo: encrypt
            docCenterId: docCenterUser.hier
          });
          cb(null);
        }
      })
    };
    tryRegister(1, docCenterUser.userName);
  }),

  /**
   *
   * @param {Object} mergeField
   * @param {string} mergeField.key
   * @param {*} mergeField.testValue
   * @param {number} mergeField.type
   */
  insertMergeField: Meteor.wrapAsync(function (hierId, mergeField, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);

    var options = {
      key: mergeField.key,
      testValue: mergeField.testValue,
      isPostBack: true,
      fieldType: mergeField.type,
      decimalPrecision: 1,
      showTime: true
    };
    console.log('\n\ninsert MF ' + options.key);

    api.post(self._docCenterUrl + '/api/MergeFields', options, function (err, response) {
      //console.log('cb', response);

      if (err){
        console.error('insert MF failed');
        cb(err);
      }else{
        console.log('insert MF success\n');
        cb(null, response.data);
      }
    });

  }),

  /**
   *
   * @param {string} name
   */
  deleteMergeField: Meteor.wrapAsync(function (hierId, key, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);
    console.log('\n\ndelete MF ' + key);

    api.del(self._docCenterUrl + '/api/MergeFields?key=' + key, function (err, response) {
      if (err){
        console.error('delete MF failed');
        cb(err);
      }else{
        console.log('delete MF success\n');
        cb(null, response.data);
      }
    });
  }),

  getDocuments: Meteor.wrapAsync(function (hierId, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);

    api.get(self._docCenterUrl + '/api/Documents', function (err, response) {
      //console.log('cb', response);

      if (err){
        console.error(err);
      }else{
        cb(null, response);
      }
    });
  }),

  insertUser: Meteor.wrapAsync(function (hierId, userData, cb) {
    console.log('insertUser');

    if (!_.isString(userData.userName) || !_.isString(userData.email)){
      throw new Error('missing fields for argument userData');
    }

    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);
    var options = {
      UserName: userData.userName,
      Email: userData.email,
      Password: userData.password || generatePassword()
    };

    api.post(self._docCenterUrl + '/api/Users', options, function (err, result) {
      if (err){
        cb(err);
      } else {
        console.log('result', result);
        options.docCenterId = result;
        cb(null, options);
      }
    });

  }),

  accountExists: function (id) {
    return Accounts.find(id).count();
  },

  getCredentials: function (id) {
    console.log('id', id);
    return Accounts.findOne(id);
  },

  /**
   *
   * @param {string} docId
   * @param {string} externalId
   * @param {Object[]} mergeFieldsValues
   * @param {string} mergeFieldsValues.key
   * @param {string} mergeFieldsValues.value
   */
  instantiateDocument: Meteor.wrapAsync(function (hierId, docId, externalId, mergeFieldsValues, cb) {

    var account = getAccount(hierId);
    var self = this;

    if (_.isString(docId)){
      docId = [docId];
    }
    var api = new DocCenterApi(account);
    var option = {
      userId: externalId,
      documentIds: docId,
      recipient: "asd asd",
      initialValues: mergeFieldsValues
    };

    console.log('\n\ninstantiate');
    console.log('option', option);

    api.post(self._docCenterUrl + '/api/DocumentInstances', option, function (err, response) {
      if (err){
        console.error('instantiate failed');
        cb(err);
      }else{
        console.log('instantiate success\n');
        cb(null, response);
      }
    });
  }),

  getDocumentInstances: Meteor.wrapAsync(function (hierId, externalId, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);

    api.get(self._docCenterUrl + '/api/DocumentInstances?userId=' + externalId, function (err, response) {
      if (err){
        console.error(err);
      }else{
        cb(null, response);
      }
    });
  }),

  getUserToken: Meteor.wrapAsync(function (hierId, externalId, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);

    api.get(self._docCenterUrl + '/api/Token?userId=' + externalId, function (err, response) {
      if (err) {
        console.error(err);
      } else {
        cb(null, response);
      }
    });
  }),

  renderDocumentInstance: Meteor.wrapAsync(function (hierId, id, cb) {

    var account = getAccount(hierId);
    var self = this;

    var authString = getAutorizationString(account);

    var api = new DocCenterApi(account);

    var options = {
      url: self._docCenterUrl + '/api/DocumentsRender?documentInstanceId=' + id,
      encoding: null,
      headers: {
        Authorization: authString
      }
    };
    request.get(options, function (err, result, body){
      if (err){
        console.error(err);
        cb(err)
      }else{
        cb(null, body);
      }
    });
  }),

  approveDocument: Meteor.wrapAsync(function (hierId, instanceId, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);

    console.log('approving');
    api.post(self._docCenterUrl + '/api/DocumentInstancesApprove/approve?documentInstanceId=' + instanceId, null, function (err, response) {
      if (err){
        console.error(err);
      }else{
        cb(null, response);
      }
    });
  }),

  denyDocument: Meteor.wrapAsync(function (hierId, instanceId, reason, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);

    var reasonParameter = reason ? '&reason=' + reason : '';

    console.log('denying', reason);
    api.post(self._docCenterUrl + '/api/DocumentInstancesApprove/deny?documentInstanceId=' + instanceId + reasonParameter, null,function (err, response) {
      if (err){
        console.error(err);
      }else{
        cb(null, response);
      }
    });
  }),

  getMergeFields: Meteor.wrapAsync(function (hierId, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);


    api.get(self._docCenterUrl + '/api/MergeFields', function (err, response) {
      if (err){
        console.error(err);
      }else{
        cb(null, response);
      }
    });
  }),

  getMergeFieldValues: Meteor.wrapAsync(function (hierId, docInstanceId, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);


    api.get(self._docCenterUrl + '/api/MergeFieldValues?documentInstanceId=' + docInstanceId, function (err, response) {
      if (err){
        console.error(err);
      }else{
        cb(null, response);
      }
    });
  })


});

var DocCenterApi = function (account) {
  var self = this;
  _.extend(self, account);
};
DocCenterApi.prototype.get = function (url, cb) {
  var self = this;

  var options = self.getHeaders();

  HTTP.get(url, options,  function (err, result) {
    //catch unauthorized error
    if (err && err.response.statusCode == 401) {

      //login again
      DocCenter.login(self._id);
      _.extend(self, Accounts.findOne(self._id));
      var authString = getAutorizationString(self);


      //change header
      options.headers.Authorization = authString;

      HTTP.get(url, options, function (err, result) {
        if (err) {
          console.log('>>failed again.. quiting');
          cb(err);
        } else {
          cb(null, result.data);
        }
      });

    } else {
      cb(err, result.data);
    }
  });

};
DocCenterApi.prototype.post = function (url, data, cb) {
  var self = this;

  var options = self.getHeaders();

  if (data){
    options.form = data
  }

  var resolve = function (err, body) {
    if (err){
      cb(err);
    }else{
      if (body){
        try{
          cb(null, JSON.parse(body));
        } catch (e) {
          cb(e);
        }
      }else{
        cb(null, {});
      }
    }
  };

  request.post(url, options, function (err, result) {
    //catch unauthorized error
    if (err && err.response && err.response.statusCode == 401) {
      //login again
      DocCenter.login(self._id);
      _.extend(self, Accounts.findOne(self._id));
      var authString = getAutorizationString(self);


      //change header
      options.headers.Authorization = authString;

      request.post(url, options, function (err, result) {
        if (err) {
          console.err('>>failed again.. quiting');
          cb(err);
        } else {
          resolve(null, result.body);
        }
      });

    } else {
      resolve(err, result.body);
    }
  });
};
DocCenterApi.prototype.del = function (url, cb) {
  var self = this;

  var options = self.getHeaders();

  request.del(url, options, function (err, result) {
    //catch unauthorized error
    if (err && err.response && err.response.statusCode == 401) {
      //login again
      DocCenter.login(self._id);
      _.extend(self, Accounts.findOne(self._id));
      var authString = getAutorizationString(self);


      //change header
      options.headers.Authorization = authString;

      request.del(url, options, function (err, result) {
        if (err) {
          console.err('>>failed again.. quiting');
          cb(err);
        } else {
          cb(null, result && result.body);
        }
      });

    } else {
      cb(err, result && result.body);
    }
  });
};

DocCenterApi.prototype.getHeaders = function () {
  var self = this;
  var authString = getAutorizationString(self);

  //if no token, get one
  if (!authString) {
    DocCenter.login(self._id);
    _.extend(self, Accounts.findOne(self._id));
    authString = getAutorizationString(self);
  }

  return {
    headers:{
      Authorization: authString
    }
  };
};


var generatePassword = function () {
  return Random.secret(8);
};

var getAccount = function (hierId) {
  var account = Accounts.findOne(hierId);
  if (!account){
    throw new Error('No account found for id ' + hierId);
  }
  return account;
};

var getAutorizationString = function (account) {
  if (! account.accessToken) return null;

  return account.type + ' ' + account.accessToken ;
};

Meteor.methods({
  'docCenter.getDocuments': function () {
    return DocCenter.getDocuments(Meteor.user().currentHierId);
  },
  'docCenter.getDocumentInstances': function (externalId) {
    return DocCenter.getDocumentInstances(Meteor.user().currentHierId, externalId);
  },

  'docCenter.login': function () {
    return DocCenter.login(Meteor.user().currentHierId);
  },

  'docCenter.instantiateDocument': function (docId, externalId, mergeFieldsValues) {
    return DocCenter.instantiateDocument(Meteor.user().currentHierId, docId, externalId, mergeFieldsValues || []);
  },
  'docCenter.accountExists': function () {
    return DocCenter.accountExists(Meteor.user().currentHierId);
  },
  'docCenter.getCredentials': function () {
    return DocCenter.getCredentials(Meteor.user().currentHierId);
  },
  
  'docCenter.approveDocument': function(id){
    return DocCenter.approveDocument(Meteor.user().currentHierId, id);
  },
  'docCenter.denyDocument': function(id, reason){
    return DocCenter.denyDocument(Meteor.user().currentHierId, id, reason);
  }
});