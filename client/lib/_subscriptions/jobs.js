Jobs = new Meteor.Collection("jobs", {
  transform: function (job) {
    job.displayName = job.publicJobTitle;
//    job.industryName = LookUps.findOne({ _id: job.industry }).displayName;
//    job.categoryName = LookUps.findOne({ _id: job.category }).displayName;
    if (job.duration != null) {
      job.durationName = LookUps.findOne({ _id: job.duration }).displayName;  
    }
    if (job.status != null) {
      job.statusName = LookUps.findOne({ _id: job.status }).displayName;
    }

    
    


//    job.calculatedstatus=JobCalculatedStatus.get(job); no calculated status for now
    if (job.customer) {
      var customer = Contactables.findOne({_id: job.customer });
      job.customerName = customer.displayName;
    }
    return job;
  }
});
extendedSubscribe('jobs', 'JobHandler');