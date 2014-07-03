Jobs = new Meteor.Collection("jobs", {
  transform: function (job) {
    //displayName for lookups
      console.log('job',job);
    job.displayName = job.publicJobTitle;
//    job.industryName = LookUps.findOne({ _id: job.industry }).displayName;
//    job.categoryName = LookUps.findOne({ _id: job.category }).displayName;
    job.durationName = LookUps.findOne({ _id: job.duration }).displayName;
    job.statusName = LookUps.findOne({ _id: job.status }).displayName;


//    job.calculatedstatus=JobCalculatedStatus.get(job); no calculated status for now
    if (job.customer) {
      var customer = Contactables.findOne({_id: job.customer });
      job.customerName = customer.displayName;
    }
    return job;
  }
});
extendedSubscribe('jobs', 'JobHandler');