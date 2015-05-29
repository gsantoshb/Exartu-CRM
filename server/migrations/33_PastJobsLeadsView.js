/**
 * Created by ramiro on 29/05/15.
 */
Migrations.add({
  version: 33,
  up: function () {
    var count = 0;
    Contactables.find({"pastJobs": {$exists: true}}).forEach(function (contactable) {
      count++;
      console.log('adding pastJobs ', count, '-', contactable._id);
      _.each(contactable.pastJobs, function (p) {
        var newPastJob = p;
        _.extend(newPastJob, {comment: "", active: true});
        _.extend(newPastJob, {_id: newPastJob.id});
        _.extend(newPastJob, {hierId: contactable.hierId});
        _.extend(newPastJob, {employeeId: contactable._id, employeeName: contactable.displayName});
        newPastJob = _.omit(newPastJob, 'id');
        var pastJoblead = PastJobLeads.findOne({_id:newPastJob._id});
        if(!pastJoblead)
          PastJobLeads.insert(newPastJob);
      })
    })
    console.log('Finished migration 33');
  }
});
