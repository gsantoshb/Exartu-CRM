var elastical = Npm.require('elastical');

ES = ES || {};

var _client;
var _indexedCollections = [];

// Connect with Elasticsearch server
// Options:
//   host
//   protocol (default: http)
//   port (default: 9200)
//   auth: token used to authenticate
ES.connect = function(options) {
  console.log('Connecting ES');

  // Create connection
  if (options.host){
    _client = new elastical.Client(options.host, {protocol: options.protocol || 'http', port: options.port || 9200, auth: options.auth});
  }else{
    _client = new elastical.Client();
  }

  // Check connection
  _client._request('/_cluster/health', Meteor.bindEnvironment(function(err) {
    if (err) {
      console.error('Error connecting to ES', err);
      return;
    }

    // Mark client as connection if server is healthy
    _client.connected = true;

    // Now that connection with server is ready all collection defined are sync.
    console.log('Indexing collections');
    _.forEach(_indexedCollections, function(index) {
      indexCollection(index);
    })
  }));

  // Create an index for the collection
  // @param index {Object}
  function indexCollection (index) {
    console.log('Index name: ' + index.name);
    _client.indexExists(index.name, Meteor.bindEnvironment(function(err, result) {
      if (!err) {
        if (result) {
          console.log('Loading ' + index.name + ' index')
          initialSync(index.collection, index.name);
        }
        else {
          console.log('Creating ' + index.name + ' index')
          _client.createIndex(index.name, function(err, result) {
            if (!err) {
              console.log("Index created ", result);
              initialSync(index.collection, index.name);
            }
            else
              console.log('index creation error',err,index);
          });
        }
      }
      else console.log('index exists error',err);
    }));
  };
};

// Used to define which collections are synchronized, which fields are considered
//  when searching and where to fetch related data
//  options:
//    - collection {Mongo.Collection} Collection that is synchronized.
//    - fields {Array} Objects that defined which fields from the document
//    on the specified collection are considered when performing a search.
//    - relation {Array} Specifies where and how to fetch information related to
//    the document.
ES.syncCollection = function(options) {
  var collection = options.collection;
  var indexName = options.indexName || collection._name;
  var type = options.type || collection._name;

  // Save sync information, when ES connection is ready this information is used
  // to sync documents that have not been synchronized before in this index (each collection has its index)
  _indexedCollections.push({name: indexName, collection: collection, fields: options.fields, relations: options.relations, type: type});

  // Define collection's hook to keep track of changes in documents
  // When a document is inserted it's synchronized on ES and a flag is set
  // to avoid duplicated indexation
  collection.after.insert(function(userId, doc) {
    indexDocument(indexName, collection, doc);
  });

  //
  collection.after.update(function(userId, doc) {
    // TODO: make update more granular, only update values that have changed
    indexDocument(indexName, collection, doc);
  });

  // TODO: Add delete hook

  // Fetch and keep track of related information defined in options.relations
  _.forEach(options.relations, function(rel) {
    if (rel.idField) {

      // Get documents in the index that related with doc and reindex them
      // in order to update its information.
      // @param {Mongo.Document} Document form the collection defined in rel
      // that have been inserted or updated.
      // TODO: Only update related values, there is no need to re-indexing the entire document
      var relationIndexing = function(doc) {
        //
        var idFieldSplitted = rel.idField.split('.');
        var root = idFieldSplitted[0];
        var ids = undefined;
        if (_.isArray(doc[root])) {
          ids = _.map(doc[root], function(link) {
            var childPath = idFieldSplitted.slice(1, idFieldSplitted.length);
            return getValue(doc, childPath);
          });
        } else {
          ids = [getValue(doc, idFieldSplitted)];
        }

        // Check ids array. It's possible that related document definition has changed
        // and therefor not matching with an old fieldId.
        if (! ids) return;

        // Get items in index that are related with doc
        var items = collection.find({_id: {$in: ids}}).fetch();

        // and then reindex each of them
        _.forEach(items, function(item) {
          indexDocument(indexName, collection, item);
        })
      };

      // Keep track of changes in data related to the document
      rel.collection.after.update(function(userId, doc) {
        // TODO: make update more granular, only update values that have changed
        relationIndexing(doc);
      });
      rel.collection.after.insert(function(userId, doc) {
        relationIndexing(doc);
      });
      // TODO: Add delete hook
    } else {
      // TODO: Direct relation
      // Documents in the indexed collection have the ids used to retrieve information from other collections
      // For instance:
      //   doc: {
      //    notes: [noteId1, noteId2]
      //   }
      // noteIdi are ids of items in Notes' collection
    }
  });

  // Index document on Elasticsearch server
  // @param indexName {String} Where the document is being indexed
  // @param collection {Mongo.Collection} Doc's collection
  // @param doc {Object} Document that is going to be indexed
  function indexDocument(indexName, collection, doc) {
    if (!isConnectionReady())
      return;

    var indexDef = getIndexedCollection(indexName);
    var index = _client.getIndex(indexName);

    var options = getIndexedCollection(indexName);


    //map document
    doc = map(doc, options.fields);

    // Set undefined and empty to null so Elasticsearch can detect those
    // fields and set a default value. Otherwise they won't be saved and
    // search will fail.
    _.forEach(_.keys(doc), function(field) {
      if (!_.isNumber(doc[field]) && _.isEmpty(doc[field]))
        doc[field] = null;
    });

    // Get information related to doc on other collections
    _.forEach(indexDef.relations, function(rel) {
      if (rel.idField) {
        // Inverse relation
        var selector = {};
        selector[rel.idField] = doc._id;
        var fields = {};
        fields[rel.valuePath] = 1;
        var relItems = rel.collection.find(selector, fields).fetch();
        doc[rel.fieldName] = _.map(relItems, function(item) {
          var value = getValue(item, rel.valuePath.split('.'));
          return { value: [value]};
        });
      } else {
        // Direct relation
        var relItems = _.clone(doc[rel.fieldName]);
        doc[rel.fieldName] = [];
        _.forEach(relItems, function(relItem) {
          var item = rel.collection.findOne({_id: relItem});
          if (item)
            doc[rel.fieldName].push(item[rel.valuePath]);
        });
      }
    });
    doc.idField=doc._id; // make the id field searchable as well
    // Index document using its type as its type
    console.log('indexing doc');
    index.index(type, doc, { id: doc._id }, Meteor.bindEnvironment(function (err, result) {
      if (!err) {
        // Mark document
        var flag = {
          $set: {}
        };
        flag.$set['_es_' + indexName] = Date.now();
        collection.direct.update({_id: doc._id}, flag, {});
      }
      else
        console.log('index document error',err);
    }));
  }
};

Meteor.methods({
  // Method called by collections' extended method 'esSearch' in client side.
  // It performs a search on Elasticsearch server and return the result to client side
  // @param indexName {String} Index's name where search will be performed
  'esSearch': function(indexName, query, filters, highlight) {
    if (!isConnectionReady())
      return;

    // At least on of the criteria defined in should must be true
    query.bool.minimum_should_match = 1;

    // Change query format if filters are defined
    if (filters.bool.must.length > 0) {
      query = {
        filtered: {
          query: query,
          filter: filters
        }
      };
    }

    // Get user's hierarchies and use them to filter documents' type
    var userHierarchiesId = _.map(Utils.getUserHiers(Meteor.userId()), function (hier) {
      return hier._id;
    });
    var hierid=Utils.getUserHierId(Meteor.userId());

    var async = Meteor._wrapAsync(
      Meteor.bindEnvironment(function(cb) {
        _client.search({query: query, size: 25, highlight: highlight, type: type, index: indexName}, function(err, result) {
          cb(err, result);
        })
      })
    );

    // Return Elasticsearch result asynchronously
    return async();
  }
});

var map = function (object, fields) {
  var result = {};
  _.each(fields, function (field) {
    var parts = field.name.split('.');
    var currentResult = result;
    var currentDoc = object;
    if (parts.length >1){
      // move currentResult and currentDoc deeper
      for(var i = 0;i <= parts.length - 2; ++i){
        currentResult[parts[i]] = currentResult[parts[i]] || {};
        currentResult = currentResult[parts[i]];
        currentDoc = currentDoc && currentDoc[parts[i]];
      }
    }
    //set the value
    currentResult[parts[parts.length - 1]] = currentDoc && currentDoc[parts[parts.length - 1]];
  });
  return result;
};

// Helper used to check the connection
var isConnectionReady = function() {
  if (!_client || !_client.connected) {
    console.error('Error connecting ES');
    return false;
  }

  return true;
};

// Fetch all document in collection that haven't been indexed yet and uploaded them
// to Elasticsearch server.
// @param collection {Mongo.Collection} Collection to be synchronized
// @param indexName {String} Name of the index where collection will be synchronized
var initialSync = function(collection, indexName) {
  // Initial sync. Index all document not indexed on this index
  var documents = collection.find().fetch();

  var options = getIndexedCollection(indexName);

  // Generate bulk's operation
  var operations = [];
  _.forEach(documents, function(document) {
    if (!document.hierId) console.log('es document no hier',document);
    if (document['_es_' + indexName])
      return; // Already indexed

    // Define operation
    var op = {
      index: indexName,
      type: options.type,
      id: document._id,
      data: map(document, options.fields)
    };

    operations.push({index: op});
  });

  if (!operations || operations.length == 0)
    return;

  console.log('calling es bulk');
  _client.bulk(operations, Meteor.bindEnvironment(function(err, result) {
    if (!err) {
      // Get documents' id of those indexed in the bulk
      var documentIds = _.map(operations, function(op) {
        return op.index.id;
      });

      // mark them as indexed on the index with name indexName
      var flag = {
        $set: {}
      };
      flag.$set['_es_' + indexName] = Date.now();
      collection.direct.update({_id: {$in: documentIds}}, flag, {multi: true});
    } else
      console.log('es bulk ops',err,result);
  }));
};

// Helper used to fetch information about index synchronizations by their indexName
// @param indeName {String}
var getIndexedCollection = function(indexName) {
  return _.findWhere(_indexedCollections, {name: indexName});
};

// Helper function used to get the value from field with path 'path' on doc
// @param doc {Object}
// @param path {String} specify field's path, it allows the next format: 'bar.foo'
var getValue = function(doc, path) {
  var tmp = doc;
  _.forEach(path, function(field) {
    if (tmp)
      tmp = tmp[field];
  });

  return tmp;
};
