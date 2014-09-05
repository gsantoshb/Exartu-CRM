Template.candidates.helpers({

  candidates:function(){

    switch (this.type) {
        case 'all':
        {
            return Candidates.find();
        }
        case 'employee':
        {
            return Candidates.find({employee:this.id});
        }
        case 'job':
        {
            return Candidates.find({job:this.id});
        }
    }
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
  jobInfo:function(candidateObject){
        return Jobs.findOne({_id: candidateObject.job});
  },
  isApplicantType: function(candidate) {
    return candidate.type == Enums.candidateType.applicant;
  }

})
Template.candidates.events({
  'click .addEditCandidates':function () {
    Composer.showModal('candidateAdd', Session.get('entityId'));
  },
  'click .assign': function () {
    var options={};
    var job=Jobs.findOne({ _id: Session.get('entityId') });
    if(job.placement){
      options.placementId=job.placement;
    }
    options.employeeId = this._id;

    Composer.showModal('placementAdd', options);
  }
})
