Placements = new Meteor.Collection("placements", {
  transform: function (asg) {
    if (asg.job) {
      var job = Jobs.findOne({_id: asg.job });
      if (job) {
        asg.jobDisplayName = job.displayName;
        asg.customerDisplayName = job.customerName;
        asg.customer = job.customer;
        asg.displayName=asg.jobDisplayName + '@' + asg.customerDisplayName;
      }
    };
    if (asg.employee) {
      var employee = Contactables.findOne({_id: asg.employee });
      if (employee) asg.employeeDisplayName=employee.displayName;
    }
    if (asg.status != null) {
      asg.statusName = LookUps.findOne({ _id: asg.status }).displayName;
    }
    return asg;
  }
});
extendedSubscribe('placements', 'PlacementHandler');