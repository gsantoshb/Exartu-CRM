Migrations.add({
  version: 32,
  up: function () {
    var count = 0;
    Contactables.find({"pastJobs": {$exists: true}}).forEach(function (contactable) {
      count++;
      console.log('adding ids ', count, '-', contactable._id);
      var arrayPastJobs = [];
      _.each(contactable.pastJobs, function (p) {
         var newPastJob = p;
         if(!newPastJob.id)
          _.extend(newPastJob, {id: Random.id()});
        arrayPastJobs.push(newPastJob);
      });
      Contactables.update({_id:contactable._id},{$set:{pastJobs:arrayPastJobs}});
    });
    console.log('Finished migration 32');
  }
});
