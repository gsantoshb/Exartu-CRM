Jobs = new Meteor.Collection('jobs', {
  transform: function (job) {
    job.displayName = job.publicJobTitle ;

    if (job.duration != null) {
      var dur=LookUps.findOne({ _id: job.duration });
      if (dur)
        job.durationName = dur.displayName;
    }
    if (job.status != null) {
      var sta=LookUps.findOne({ _id: job.status });
      if (sta)
        job.statusName = sta.displayName;
    }

    if (job.location)
      job.location.displayName = Utils.getLocationDisplayName(job.location);

    return job;
  }
});

AllJobs = new Meteor.Collection('allJobs', {
  transform: function (job) {
    var customer = AllContactables.findOne(job.customer);
    job.displayName = job.publicJobTitle + '@' + customer.displayName;
    return job;
  }
});