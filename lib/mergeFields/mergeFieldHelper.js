
MergeFieldHelper = {};

// Merge field Categories
_.extend(MergeFieldHelper, { categories: {
  employee: { name: 'Employee', value: 'employee' },
  client: { name: 'Client', value: 'client' },
  contact: { name: 'Contact', value: 'contact' }
}});


// Merge field functions
_.extend(MergeFieldHelper, {
  // Get merge fields by category
  getMergeFields: function (category) {
    // Validate
    category = category.toLowerCase();
    if (!category) throw new Error('Category is required');
    if (! _.contains(_.pluck(_.values(MergeFieldHelper.categories), 'value'), category)) throw new Error('Invalid category');

    return _.filter(MergeFieldHelper.mergeFields, function (mergeField) { return mergeField.category === category } );
  },

  // Get template text preview
  getPreview: function (text) {
    var result = text;

    // Extract a list of the merge fields in the text
    var mergeFields = getMergeFields(result);

    // Replace all the merge field instances
    _.each(mergeFields, function (mf) {
      var value = mf.testValue;
      // Regex to find tags with the data-merfield on it while avoiding including other tags in the matching expression
      var regex = new RegExp("<[^><]*data-mergefield=\"" + mf.key + "\"[^><]*>", 'g');
      result = result.replace(regex, value);
    });

    return result;
  },

  // Get template instance for contactable
  getInstance: function (text, contactable) {
    var result = text;

    // Extract a list of the merge fields in the text
    var mergeFields = getMergeFields(result);

    // Replace all the merge field instances
    _.each(mergeFields, function (mf) {
      var value = mf.getValue(contactable);
      // Regex to find tags with the data-merfield on it while avoiding including other tags in the matching expression
      var regex = new RegExp("<[^><]*data-mergefield=\"" + mf.key + "\"[^><]*>", 'g');
      result = result.replace(regex, value);
    });

    return result;
  }
});


// Helpers
var getMergeFields = function (text) {
  var patternFind = /data-mergefield="(\w+)"/g;
  var result= {};

  // Iterate over all the occurrences of merge fields in the text
  var match;
  while (match = patternFind.exec(text)) {
    // regex matches gives two elements where the second is the group
    if (match && match.length > 0 && !result[match[1]]) {
      result[match[1]] = _.find(MergeFieldHelper.mergeFields, function (mf) {return mf.key === match[1]});
    }
  }
  return _.values(result);
};
