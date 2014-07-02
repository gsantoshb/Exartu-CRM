Template.candidates.helpers({
  candidates:function(){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    return job.candidates
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  employeeInfo:function(candidateObject){
    return Contactables.findOne({_id: candidateObject.employee});
  },

})
Template.candidates.events({
  'click .addEditCandidate': function () {
    Composer.showModal('candidateAdd', Session.get('entityId'));
  },
  'click .assign': function () {
    var options={};
    var job=Jobs.findOne({ _id: Session.get('entityId') });
    if(job.assignment){
      options.assignmentId=job.assignment;
    }
    options.employeeId = this._id;

    Composer.showModal('assignmentAdd', options);
  }
})
