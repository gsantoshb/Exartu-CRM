
Migrations.add({
  version: 3,
  up: function() {
    LookUps.remove({hierId: ExartuConfig.SystemHierarchyId});

    Hierarchies.find().forEach(function(doc, index, cursor){
      seedSystemLookUps(doc._id);
    })
  }
});