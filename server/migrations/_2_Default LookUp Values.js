// Add array of default values to old hierarchies
Migrations.add({
  version: 2,
  up: function() {
    Hierarchies.update({defaultLookUpValues : { $exists: false}}, {$set: {defaultLookUpValues: []}}, { multi: true });
  }
});