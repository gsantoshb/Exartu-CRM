// Add House Account customer for old hierarchies
Migrations.add({
  version: 5,
  up: function() {
    var allHiers= Hierarchies.find({});
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

    console.log('updating jobs..')
    Jobs.find({customer: null}).forEach(function(job){
      var houseAccount= Contactables.findOne({
        hierId: job.hierId,
        houseAccount: true
      });
      if (houseAccount){
        Jobs.update({ _id: job._id }, { $set: {customer: houseAccount._id}});
      }
    })


  }
});