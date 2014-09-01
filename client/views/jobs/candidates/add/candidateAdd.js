Template.candidateAdd.viewModel = function (jobId) {
  var self = this;
  self.entity = ko.mapping.fromJS({
    note: '',
    employee: null,
    type: Enums.candidateType.recruiter,
    userId: Meteor.userId()
  });

  self.oldCandidates = Jobs.findOne({_id: jobId}).candidates;

  self.employees = ko.meteor.find(Contactables, {
    Employee: {
      $exists: true
    },
    _id: {
      $nin: _.map(self.oldCandidates, function (candidate) {
        return candidate.employee;
      })
    }
  });
  self.add = function () {
    var employee=self.entity.employee();
    self.entity.employee(null);
    if (_.isEmpty(employee)) return;
    var candidate = {
      note: self.entity.note(),
      employee: employee,
      type: Enums.candidateType.recruiter,
      job: jobId,
      userId: Meteor.userId()
    };

    if (!candidate.employee)
      return;

    Candidates.insert(candidate, function(err, result) {
      if (!err)
      {
        console.log('candidate err',err);
        self.close();
      }

    });
  }
  return self;
}