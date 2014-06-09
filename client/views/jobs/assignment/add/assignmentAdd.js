var assignment=null;
var employeeId=null;
var newRate={
  type:null,
  pay: 0,
  bill: 0
}
var assignmentDependency=new Deps.Dependency;
var employeeDependency=new Deps.Dependency;
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
  newRate:function(){
    return newRate;
  },
  getAvailableType: function(){
    var rateTypes=JobRateTypes.find().fetch();
    return _.filter(rateTypes,function(type){
      return ! _.findWhere(assignment.rates,{type: type._id});
    });
  },
  isSelected: function(id){
    employeeDependency.depend();
    return employeeId==id;
  }
})

Template.assignmentAdd.events({
  'click .save':function(){
    if (!employeeId)
      return;

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
  'click .addRate': function(){
    if (! newRate.type) return;

    assignment.rates.push(newRate);
    assignmentDependency.changed();
  },
  'click .removeRate': function(){
    assignment.rates= _.without(assignment.rates, this);
    assignmentDependency.changed();
  },
  'change .newRateType': function(e){
    newRate.type= e.target.value;
  },
  'change .employeeSelect':function(e){
    employeeId= e.target.value;
  },
  'change .payRateInput': function(e){
    this.pay= e.target.value;
  },
  'change .billRateInput': function(e){
    this.bill= e.target.value;
  },
  'change .hasEnded': function(e){
    if(e.target.checked){
      assignment.end=new Date;
    }else{
      assignment.end=null;
    }
    assignmentDependency.changed();
  }
});
