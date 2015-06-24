Migrations.add({
  version: 36,
  up: function () {
    var count = 0;
    Contactables.find({"Employee":{$exists:true}}).forEach(function (c) {
      count++;
      console.log(""+count+" "+ c._id);
      var pastJobArray = [];
      var needUpdate = false;
      _.each(c.pastJobs, function(p){

        if(!p.dateCreated){
          needUpdate = true;
          var updatedPastJob = p;
          _.extend(updatedPastJob,{dateCreated: c.dateCreated})
          pastJobArray.push(updatedPastJob);
          console.log("update "+p.id);
          PastJobLeads.update({_id: p.id},{$set:{dateCreated: c.dateCreated}})
        }
        else{
          PastJobLeads.update({_id: p.id},{$set:{dateCreated: c.dateCreated}})
          pastJobArray.push(p);
        }
      })
      if(pastJobArray.length>0 && needUpdate) {
        Contactables.update({_id: c._id}, {$set: {pastJobs: pastJobArray}})
      }
    });
    console.log('Finished migration 36');
  }
});
