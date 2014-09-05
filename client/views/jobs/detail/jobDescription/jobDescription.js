
var generateReactiveObject = function(job) {
  return new dType.objInstance(job, Jobs);
};

Template.jobDescription.created=function() {
  self.editMode = false;
  var originalJob = Jobs.findOne({ _id: Session.get('entityId') });
};

Template.jobDescription.rendered = function() {
  $('.bsTooltip').tooltip();
};


Template.jobDescription.helpers({
  getType: function(){
    return Enums.linkTypes.job;
  }
})

// Job description
var jobDescriptionEditMode = false;
var jobDescriptionEditModeDep = new Deps.Dependency;
var descriptionSelf={}
Utils.reactiveProp(descriptionSelf, 'previewMode', false);

Template.jobDescription.colorPreviewMode= function(){
  return descriptionSelf.previewMode ? '#008DFC' : '#ddd'
}

Template.jobDescription.previewMode= function(){
  return descriptionSelf.previewMode;
}

Template.jobDescription.editMode = function() {
  jobDescriptionEditModeDep.depend();
  return jobDescriptionEditMode;
};

Template.jobDescription.colorDescriptionEdit = function() {
  jobDescriptionEditModeDep.depend();
  return jobDescriptionEditMode ? '#008DFC' : '#ddd';
};

Template.jobDescription.events = {
  'click .editJobDescription': function(){
    jobDescriptionEditMode = !jobDescriptionEditMode;
    jobDescriptionEditModeDep.changed();
  },
  'click #cancelJobDescriptionEdit':function(){
    jobDescriptionEditMode = false;
    jobDescriptionEditModeDep.changed();
  },
//  'click #saveJobDescriptionEdit':function() {
//    var update = job.getUpdate();
//    if (!update.$set || !update.$set.jobDescription) {
//      jobDescriptionEditMode = false;
//      jobDescriptionEditModeDep.changed();
//      return; // Nothing to update
//    }
//    console.log('job',job);
//    Jobs.update({_id: job._id}, {$set: { jobDescription: update.$set.jobDescription }}, function(err, result) {
//      if (!err) {
//        jobDescriptionEditMode = false;
//        jobDescriptionEditModeDep.changed();
//        job.jobDescription.defaultValue = job.jobDescription.value; // Reset jobDescription initial value
//      }
//    });
//  },
  'click .previewMode': function(){
    descriptionSelf.previewMode= ! descriptionSelf.previewMode;
  }
};
