// Add House Account customer for old hierarchies
Migrations.add({
  version: 5,
  up: function() {
    var allHiers= Hierarchies.find({});
    var oldHiers=[];
    allHiers.forEach(function(hier){
      if (hier._id != ExartuConfig.SystemHierarchyId){
        var houseAccount= Contactables.findOne({
          hierId: hier._id,
          houseAccount: true
        })
        if (!houseAccount){
          console.log('adding house account for hier '+ hier.name + ' ('+ hier._id + ')')
          createHouseAccount(hier);
        }
      }
    })

  }
});