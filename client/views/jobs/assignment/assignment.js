Template.assignment.helpers({
  employeeAssignment:function(){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    if(job.employeeAssigned)
      return  Contactables.findOne({
        _id: job.employeeAssigned
      });
    else
      return null
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
})
Template.assignment.events({
  'click .editAssign':function () {
    Composer.showModal( 'assignmentAdd', Session.get('entityId'));
  }
});