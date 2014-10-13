jobList = new Meteor.Collection('jobList', {
  transform: function (job) {
    job.displayName = job.publicJobTitle ;
//    job.industryName = LookUps.findOne({ _id: job.industry }).displayName;
//    job.categoryName = LookUps.findOne({ _id: job.category }).displayName;

    if (job.duration != null) {
      var dur=LookUps.findOne({ _id: job.duration });
      if (dur) job.durationName = dur.displayName
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





//    job.calculatedstatus=JobCalculatedStatus.get(job); no calculated status for now
    if (job.customerInfo) {
      //var customer = Contactables.findOne({_id: job.customer });
      job.customerName = job.customerInfo.displayName;
    }else{
      job.customerName = job.customer ? 'Error' : '';
    }
    return job;
  }
});
Jobs = new Meteor.Collection('jobs', {
  transform: function (job) {
    job.displayName = job.publicJobTitle ;

    if (job.duration != null) {
      var dur=LookUps.findOne({ _id: job.duration });
      if (dur) job.durationName = dur.displayName
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

JobHandler = Meteor.paginatedSubscribe('jobList');