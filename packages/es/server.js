var elastical = Npm.require('elastical');
var client = new elastical.Client('maple-6361575.us-east-1.bonsai.io', {protocol: 'https', port: 443, auth: 'gozu1u5j:qav6bial6tlrryr0'});

Meteor.startup(function() { 
  client.createIndex('exartu', function(err, result) {
    if (!err)
      console.log("Index created ", result);
    else
      console.log(err);
  });

  Contactables.after.insert(function(userId, doc) {
    exartu = client.getIndex('exartu');
    exartu.index('contactables', doc, { id: doc._id }, function (err, result) {
      if (!err)
        console.log('Contactable indexed!', result);
      else
        console.log(err);
    });
  });
});

Meteor.methods({
  'getContactables': function(stringSearch) {
    client.search({query: { regexp: { "person.firstName": stringSearch }}, index: 'exartu'}, function(err, result) {
      if (!err)
        console.log('Result: ', result);
      else
        console.log(err);
    })
  },
  'getDocument': function(id) {
    client.get('exartu', id, function(err, result) {
      if (!err)
        console.log('Result: ', result);
      else
        console.log(err);
    })
  }
})