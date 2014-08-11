ES = ES || {};

var elastical = Npm.require('elastical');
var client;
var pendingCollectionIndexing = [];

var checkClientConnection = function() {
  if (!client)
    throw new Meteor.Error(500, 'Error connecting ES');
};

ES.connect = function(options) {
  console.log('Connecting ES')
  client = new elastical.Client(options.host, {protocol: options.protocol, port: options.port, auth: options.auth});

  checkClientConnection();

  console.log('Indexing collections');
  _.forEach(pendingCollectionIndexing, function(index) {
    indexCollection(index);    
  })
};

var initialSync = function(collection, indexName) {
  // Initial sync. Index all document not indexed
  var documents = collection.find().fetch();
  // Generate bulk's operation
  var operations = [];
  _.forEach(documents, function(document) {
    if (document['_es_' + indexName])
      return; // Already indexed
    var op = {
      index: indexName,
      type: document.hierId,
      id: document._id,
      data: document
    };
    operations.push({index: op});
  });

  if (!operations || operations.length == 0)
    return;

  client.bulk(operations, Meteor.bindEnvironment(function(err, result) {
    if (!err) {
      var documentIds = _.map(operations, function(op) {
        return op.index.id;
      });
      var flag = {
        $set: {}
      };
      flag.$set['_es_' + indexName] = Date.now();
      collection.update({_id: {$in: documentIds}}, flag, {multi: true});
    } else
      console.log(err);  
  }));
};

var indexCollection = function(index) {
  client.indexExists(index.name, Meteor.bindEnvironment(function(err, result) {
    if (!err) {
      if (result) {
        console.log('Loading ' + index.name + ' index')
        initialSync(index.collection, index.name);
      }
      else {
        console.log('Creating ' + index.name + ' index') 
        client.createIndex(index, function(err, result) {
          if (!err) {
            console.log("Index created ", result);
            initialSync(index.collection, index.name);
          }
          else
            console.log(err);
        });
      }
    }
  }));
};

ES.syncCollection = function(options) {
  var collection = options.collection; 
  var indexName = collection._name;

  // Index when client is connected
  pendingCollectionIndexing.push({name: indexName, collection: collection});

  // Insert hook
  collection.after.insert(function(userId, doc) {
    checkClientConnection();

    index = client.getIndex(indexName);
    index.index(Meteor.user().hierId, doc, { id: doc._id }, Meteor.bindEnvironment(function (err, result) {
      if (!err) {
        console.log('Document indexed in ' + indexName);
        // Mark document
        var flag = {
          $set: {}
        };
        flag.$set['_es_' + indexName] = Date.now();
        collection.update({_id: doc._id}, flag);
      }
      else
        console.log(err);
    }));
  });
};

Meteor.methods({
  'esSearch': function(index, query) {
    checkClientConnection();

    var async = Meteor._wrapAsync(
      Meteor.bindEnvironment(function(cb) {
        client.search({query: query, type: Meteor.user().hierId, index: index}, function(err, result) {
          cb(err, result);
        })
      })
    );

    return async();
  }
});