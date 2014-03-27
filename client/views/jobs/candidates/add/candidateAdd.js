Template.candidateAdd.viewModel = function (jobId) {
  var self = this;
  //    debugger
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
    var candidate = {
      note: self.entity.note(),
      employee: self.entity.employee(),
      type: Enums.candidateType.recruiter,
      userId: Meteor.userId()
    };
    if (!candidate.employee)
      return;

    Meteor.call('createCandidate', candidate, jobId, function(err, result) {
      if (!err)
        self.close();
    });
  }
  return self;
}