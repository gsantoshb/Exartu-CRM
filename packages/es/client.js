ES = ES || {};

ES.syncCollection = function(options) {
  var collection = options.collection;
  collection.esSearch = function(searchString, cb) {
  	var query = {
  		regexp: {}
  	};
	  _.forEach(options.fields, function(field) {
	    query.regexp[field] = searchString;
	  });
  	Meteor.call('esSearch', options.collection._name, query, function(err, result) {
  		if (!err) {
  			debugger;
  		}

  		cb && cb.call(err, result);
  	});
  };
}