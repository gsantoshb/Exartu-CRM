var self={}
Utils.reactiveProp(self,'showOld', false);

Template.assignment.helpers({
  currentAssignment:function(assignment){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    if(job.assignment){
      return Assignments.findOne({_id: job.assignment});
    }else{
      return null
    }
  },
  showOld:function(){
    return self.showOld;
  },
  oldAssignments: function(){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    return Assignments.find({
      job: Session.get('entityId'),
      _id: {$ne:job.assignment}
    })
  }
})
Template.assignment.events({
  'click .editAssign':function () {
    Composer.showModal( 'assignmentAdd');
  },
  'click .showOld': function(){
    self.showOld=! self.showOld;
  }
});

Template.employeeInfo.helpers({
  employeeData:function(){
    return Contactables.findOne({
      _id: this.employee
    });
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  }
})
