
Jobs = new Meteor.Collection('jobs', {
  transform: function (job) {
    job.displayName = job.publicJobTitle ;

    if (job.duration != null) {
      var dur=LookUps.findOne({ _id: job.duration });
      if (dur) job.durationName = dur.displayName;
      else
      {
        console.log('corrupt job duration setting ',job);
      }
    }
    if (job.status != null) {
      var sta=LookUps.findOne({ _id: job.status });
      if (sta)
        job.statusName = sta.displayName;
      else
      {
        console.log('corrupt job status setting ',job);
      }
    }

    return job;
  }
});