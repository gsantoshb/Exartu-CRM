
Migrations.add({
  version: 4,
  up: function() {
    Hierarchies.find({ configuration: { $exists: false } }).forEach(function(doc, index, cursor){
      console.log('Adding configuration to ' + doc.name);
      Hierarchies.update({_id: doc._id}, { $set: { configuration: { webName: doc.name, title: doc.name } } });
    })
  }
});