DocCenter = {
  mergeFieldTypes: {
    string: 1,
    decimal: 2,
    date: 3
  },

  getDocuments: function (cb) {
    Meteor.call('docCenter.getDocuments', function(err, result){
      if (err){
        return console.log(err);
      }
      cb(result);
    })
  },
  /**
   *
   * @param {string} docId
   * @param {string} externalId
   * @param {Object[]} mergeFieldsValues
   * @param {string} mergeFieldsValues.name
   * @param {string} mergeFieldsValues.value
   */
  instantiateDocument: function (docId, externalId, mergeFieldsValues, cb) {
    Meteor.call('docCenter.instantiateDocument', docId, externalId, mergeFieldsValues, function(err, result){
      if (err){
        return console.log(err);
      }
      cb(result);
    })
  },
  /**
   *
   * @param {string} docInstanceId
   */
  deleteDocumentInstance: function (docInstanceId, cb) {

  },
  /**
   *
   * @param {string} docInstanceId
   */
  getMergeFieldsValues: function (docInstanceId, cb) {

  },
  /**
   *
   * @param {string} externalId
   */
  getDocumentInstances: function (externalId, cb) {
    Meteor.call('docCenter.getDocumentInstances', externalId, function(err, result){
      if (err){
        return console.log(err);
      }
      cb(result);
    })
  },
  getInstancePdf: function (docInstanceId, cb) {

  },
  /**
   *
   * @param {string} documentId
   */
  approveDocument: function (documentId, cb) {
    Meteor.call('docCenter.approveDocument', documentId, function(err, result){
      if (err){
        return console.log(err);
      }
      cb(result);
    })
  },
  /**
   *
   * @param {string} documentId
   */
  denyDocument: function (documentId, reason, cb) {
    Meteor.call('docCenter.denyDocument', documentId, reason, function(err, result){
      if (err){
        return console.log(err);
      }
      cb(result);
    })
  },

  insertUser: function (userData, cb) {
    Meteor.call('docCenter.insertUser', userData, cb);
  },
  accountExists: function (cb) {
    Meteor.call('docCenter.accountExists', function(err, result){
      if (err){
        return console.log(err);
      }
      cb(result);
    });
  },
  getCredentials: function (cb) {
    Meteor.call('docCenter.getCredentials', function(err, result){
      if (err){
        return console.log(err);
      }
      cb(result);
    });
  }

};