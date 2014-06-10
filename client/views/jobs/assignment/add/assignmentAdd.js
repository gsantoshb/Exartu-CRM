var assignment=null;
var employeeId=null;

var assignmentDependency=new Deps.Dependency;
var employeeDependency=new Deps.Dependency;
Template.assignmentAdd.created=function(){
  assignment=null;
}
Template.assignmentAdd.helpers({
  assignment:function(){
    var jobId=this[0],
      employeeParameter=this[1];
    if(employeeParameter){
      employeeId=employeeParameter;
      employeeDependency.changed()
    }
    if(!assignment){
      var job=Jobs.findOne({
        _id: jobId
      });
      assignment= {
        start: new Date(),
        end: null,
        rates: job.jobRates
      };
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
  getType: function(typeId){
    return  JobRateTypes.findOne({ _id: typeId });
  },
  isSelected: function(id){
    employeeDependency.depend();
    return employeeId==id;
  }
})

Template.assignmentAdd.events({
  'change .employeeSelect':function(e, ctx){
    employeeId= e.target.value;
  },
  'click .save':function(e, ctx){
    if (!employeeId){

      return;
    }

    assignment.job= Session.get('entityId');
    assignment.employee= employeeId;
    Assignments.insert(assignment,function(err, result){
      if(err){
        console.log(err)
      }else{
        $('.modal-host').children().modal('toggle')
      }
    });
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



