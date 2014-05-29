var assignment=null;
var employeeId=null;
var newRate={
  type:null,
  pay: 0,
  bill: 0
}
var endDateDependency=new Deps.Dependency;
Template.assignmentAdd.helpers({
  assignment:function(){
    if(!assignment){
      var job=Jobs.findOne({
        _id: Session.get('entityId')
      });
      assignment= {
        start: new Date(),
        end: null,
        rates: job.rates
      };
    }
    endDateDependency.depend();
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
    endDateDependency.changed();
  }
});
