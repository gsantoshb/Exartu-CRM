Accounts = new Meteor.Collection('docCenterAccounts');

_.extend(DocCenter,{
  _authkey: 'Tw04ksHr5',
  _docCenterUrl: 'http://hrconcourseapi.aidacreative.com',

  login: Meteor.wrapAsync(function (hierId, cb) {
    debugger;
    var account = getAccount(hierId);

    var data = {
      grant_type: 'password',
      username : account.userName,
      password : account.password
    };

    HTTP.post(this._docCenterUrl + '/token', {
      params: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, function (err, response) {
      if (err){
        //console.error(err);
        cb(err);
      }else{
        //console.log(response);
        console.log('token', response.data.access_token);

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
    //generate a docCenter user

    var docCenterUser = {
      UserName: userName,
      Email: email,
      Password: generatePassword(),
      Hier: hierId,
      Authkey: this._authkey
    };

    console.log(docCenterUser);

    HTTP.post(this._docCenterUrl + '/api/Account', { data: docCenterUser}, function (err, response) {
      if (err){
        console.error(err);
        cb(err);
      }else {
        console.log('response', response);
        Accounts.insert({
          _id: hierId,
          userName: docCenterUser.UserName,
          password: docCenterUser.Password //todo: encrypt
        });
        cb(null);
      }
    })
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

    api.post(self._docCenterUrl + '/api/MergeFields', {data: options}, function (err, response) {
      //console.log('cb', response);

      if (err){
        console.error(err);
      }else{
        cb(null, response.data);
      }
    });

  }),

  /**
   *
   * @param {string} name
   */
  deleteMergeField: function (name, cb) {

  },

  getDocuments: Meteor.wrapAsync(function (hierId, cb) {
    var account = getAccount(hierId);
    var self = this;

    var api = new DocCenterApi(account);

    api.get(self._docCenterUrl + '/api/Documents', function (err, response) {
      //console.log('cb', response);

      if (err){
        console.error(err);
      }else{
        cb(null, response.data);
      }
    });
  }),

  insertUser: Meteor.wrapAsync(function (hierId, userData, cb) {
    console.log('insertUser');

    if (! userData.userName || ! userData.email){
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
    console.log('options', options);

    api.post(self._docCenterUrl + '/api/Users', { data: options }, function (err, response) {
      if (err){
        cb(err);
      }else{
        console.log('response.data', response.data);
        cb(null, response.data);
      }
    });

  }),

  accountExists: function (id) {
    return Accounts.find(id).count();
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

    var api = new DocCenterApi(account);
    var option = {
      userId: externalId,
      documentIds: [docId],
      recipient: "asd asd",
      initialValues: mergeFieldsValues
    };

    console.log('option', option);

    api.post(self._docCenterUrl + '/api/DocumentInstances', { data: option }, function (err, response) {
      if (err){
        cb(err);
      }else{
        cb(null, response.data);
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
        cb(null, response.data);
      }
    });
  })
});

var DocCenterApi = function (account) {
  var self = this;
  _.extend(self, account);
};

_.each(['get', 'post'], function (method) {
  DocCenterApi.prototype[method] = function (/*arguments*/) {
    debugger;
    var self = this,
      url = arguments[0],
      options = arguments[1] && _.isFunction(arguments[1]) ? {} : arguments[1],
      cb = _.isFunction(arguments[arguments.length - 1]) ? arguments[arguments.length - 1] : function () {
      };

    var authString = getAutorizationString(self);

    //if no token, get one
    if (!authString) {
      DocCenter.login(self._id);
      _.extend(self, Accounts.findOne(self._id));
      authString = getAutorizationString(self);
    }

    //add Authorization header

    options.headers = options.headers || {};
    options.headers.Authorization = authString;

    console.log('>>calling', options);


    //make the call
    HTTP[method](url, options, function (err, response) {
      //catch unauthorized error
      //console.log('err',err);
      if (err && err.response.statusCode == 401) {
        console.log('>>unauthorized.. retrying');

        //login again
        DocCenter.login(self._id);
        _.extend(self, Accounts.findOne(self._id));
        authString = getAutorizationString(self);


        //change header
        options.headers.Authorization = authString;
        console.log('>>calling again', options);

        HTTP.get(url, options, function (err, response) {
          if (err) {
            console.log('>>failed again.. quiting');
            cb(err);
          } else {
            cb(null, response);
          }
        });

      } else {
        cb(null, response);
      }
    })
  }
});


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
  //'docCenter.register': function () {
  //  var user = Meteor.user();
  //  var hier = Hierarchies.findOne(user.currentHierId);
  //  var email = user.emails[0].address;
  //
  //  DocCenter.register(hier.name, email, hier._id);
  //},

  'docCenter.getDocuments': function () {
    return DocCenter.getDocuments(Meteor.user().currentHierId);
  },
  'docCenter.getDocumentInstances': function (externalId) {
    console.log('externalId', externalId);
    return DocCenter.getDocumentInstances(Meteor.user().currentHierId, externalId);
  },

  'docCenter.login': function () {
    return DocCenter.login(Meteor.user().currentHierId);
  },

  //'docCenter.insertMergeField': function (mf) {
  //  return DocCenter.insertMergeField(Meteor.user().currentHierId, mf);
  //},

  'docCenter.insertUser': function (userData) {
    return DocCenter.insertUser(Meteor.user().currentHierId, userData);
  },

  'docCenter.instantiateDocument': function (docId, externalId, mergeFieldsValues) {
    return DocCenter.instantiateDocument(Meteor.user().currentHierId, docId, externalId, mergeFieldsValues || []);
  },
  'docCenter.accountExists': function (id) {
    return DocCenter.accountExists(id);
  }
});
