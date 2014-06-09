// Set default plan code 0 (free plan) to old hierarchies
Migrations.add({
  version: 1,
  up: function() {
    Hierarchies.update({$exists: { planCode: false}}, {$set: {planCode: 0}}, { multi: true });
  }
});