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
    var client = AllContactables.findOne(job.client);
    job.displayName = job.publicJobTitle + '@' + client.displayName;
    return job;
  }
});

JobsList = new Meteor.Collection('jobsList', {
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

JobsView = new Mongo.Collection("jobsView");
