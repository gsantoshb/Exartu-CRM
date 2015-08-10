ES = ES || {};

// Used to define which collections are synchronized, which fields are considered
// when searching and where to fetch related data
// options:
//   - collection {Mongo.Collection} Collection that is synchronized.
//   - fields {Array} Objects that defined which fields from the document
//   on the specified collection are considered when performing a search.
//   - relation {Array} Specifies where and how to fetch information related to
//   the document.
ES.syncCollection = function (options) {
  var collection = options.collection;

  // Create query and filter and then call Meteor method 'esSearch'
  // @param searchString {String} string used to perform the search on Elasticsearch
  // @param filters {Object} filter defined by the user using Elasticsearch query syntax
  // @param cb {Function} function called when result is ready
  collection.esSearch = function (searchString, filters, cb) {
    // Split string by space in order to search all words typed
    var splitedSearchString = searchString.toLowerCase().trim().split(" ");

    // Create query object using bool query to combine multiple queries
    var query = {
      bool: {
        should: []
      }
    };
    var q = query.bool.should;

    // Define object to highlight search results on one or more fields
    var highlight = {
      "pre_tags": ["<strong>"],
      "post_tags": ["</strong>"],
      fields: {}
    };

    // Define query using splitted string and only considering fields that were specified
    q.regexp = {};
    _.forEach(options.fields, function (field) {
      if (field.search === false){
        return;
      }
      var boost = undefined;
      if (_.isObject(field)) {
        boost = field.boost;
        field = field.name;
      }

      _.forEach(splitedSearchString, function (tokenSearch) {
        var regexp = {};

        if(boost){
          regexp[field] = {value: tokenSearch, boost: boost};
        }
        else {
          regexp[field] = tokenSearch;
        }
        q.push({regexp: regexp});
      });

      // Set highlight option for all fields defined
      highlight.fields[field] = {};
    });
    // Call server side method 'esSearch' using collection name as the index name
    Meteor.call('esSearch', options.indexName, query, filters, highlight, function (err, result) {
      if (!err) {
        //console.log(result);
      }

      // Set result to empty object if it's not defined
      if (!result)  { result = { hits: [] } }

      // Renaming highlight result
      _.forEach(result.hits, function (hit) {
        _.forEach(hit.highlight, function (value, propertyName) {
          var field = _.findWhere(options.fields, {name: propertyName});
          if (field && field.label) {
            hit.highlight[field.label] = hit.highlight[propertyName];
            delete hit.highlight[propertyName];
          }
        })
      });

      cb && cb.call({}, err, result);
    });
  };
};