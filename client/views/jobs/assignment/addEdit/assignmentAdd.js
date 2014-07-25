var assignment=null;
var assignmentDependency=new Deps.Dependency;

Template.assignmentAdd.created=function(){
  assignment=null;
};

var init=function(options){
  var employeeId;
  var jobId;
  var options= options || {};

  assignmentDependency.changed();

  // Check for an existing assignment
  if (options.assignmentId) {
    var assignment = Assignments.findOne({_id: options.assignmentId});
    employeeId = options.employeeId || assignment.employee;

    jobId = assignment.job;
    return {
      start: assignment.start,
      end: assignment.end,
      rates: assignment.rates,
      job: jobId,
      employee: employeeId,
      _id: options.assignmentId
    }
  } else {
    var employeeParameter = options.employeeId;
    if (employeeParameter) {
      employeeId = employeeParameter;
    }

    jobId = options.jobId || Session.get('entityId');
    var job = Jobs.findOne({ _id: jobId });

    return {
      start: job.startDate,
      end: job.endDate,
      rates: job.jobRates,
      job: jobId,
      employee: employeeId
    };
  }
};

Template.assignmentAdd.helpers({
  assignment:function(){
    var params=this[0];

    if(!assignment){
      assignment= init(params)
    }

    assignmentDependency.depend();
    return assignment;
  },

  employees:function(){
    return Contactables.find({
      Employee: {
        $exists: true
      }
    });
  },

  action: function(){
    assignmentDependency.depend();
    return (assignment && assignment._id) ? 'Edit' : 'Create';
  },

  getType: function(typeId){
    return  JobRateTypes.findOne({ _id: typeId });
  },

  isSelected: function(id){
    assignmentDependency.depend();
    return assignment && (assignment.employee==id);
  },

  getJobStart: function(){
    var job=Jobs.findOne({
      _id: assignment.job
    });
    return job && job.startDate;
  },

  getJobEnd: function(){
    var job=Jobs.findOne({
      _id: assignment.job
    });
    return job && job.endDate;
  }
});

Template.assignmentAdd.events({
  'change .employeeSelect': function (e, ctx) {
    assignment.employee = e.target.value;
  },

  'click .save': function (e, ctx) {
    if (!assignment.employee) {
      return;
    }

    //Update candidates for this job
    var newCandidate = Candidates.findOne({ job: assignment.job, employee: assignment.employee });
    var currentCandidate = Candidates.findOne({ job: assignment.job, assigned: true });
    if (currentCandidate && currentCandidate._id != newCandidate._id) {
      Candidates.update({ _id: currentCandidate._id }, { $unset: { assigned: "" }});
    }
    Candidates.update({ _id: newCandidate._id }, { $set: { assigned: true }});

    if (assignment._id) {
      Assignments.update({_id: assignment._id}, {
        $set: {
          start: assignment.start,
          end: assignment.end,
          rates: assignment.rates,
          employee: assignment.employee
        }
      }, function (err, result) {
        if (err) {
          console.log(err)
        } else {
          $('.modal-host').children().modal('toggle')
        }
      });
    } else {
      Assignments.insert(assignment, function (err, result) {
        if (err) {
          console.log(err)
        } else {
          $('.modal-host').children().modal('toggle')
        }
      });
    }
  },

  'change .hasEnded': function(e){
    if(e.target.checked){
      assignment.end=new Date;
    }else{
      assignment.end=null;
    }
    assignmentDependency.changed();
  },

  'change.dp .startDate > .dateTimePicker': function(e, ctx) {
    if ($(e.target).hasClass('dateTimePicker')){
      assignment.start = $(e.target).data('DateTimePicker').date.toDate();
    }
  },

  'change.dp .endDate > .dateTimePicker': function(e, ctx) {
    if ($(e.target).hasClass('dateTimePicker')){
      assignment.end = $(e.target).data('DateTimePicker').date.toDate();
    }
  }
});



