
Template.contactableAssignmentsBox.hasAssignments = function() {
  return _.isObject(this.Employee);
};

Template.contactableAssignmentsBox.assignments = function() {
  var assignments = Assignments.find({employee: this._id, inactive: {$ne: true}}).fetch();

  _.forEach(assignments, function(assignment) {
    var job = Jobs.findOne({
      _id: assignment.job
    }, {
      transform: null
    });

    var customer = Contactables.findOne({_id: job.customer}, {transform: null});

    assignment.job = job._id;
    assignment.jobTitle = job.publicJobTitle;
    if (customer) {
      assignment.customerName = customer.organization.organizationName;
      assignment.customer = customer._id;
    }
  });

  return assignments;
};


