Template.jobDescription.created=function() {
  self.editMode = false;
  var originalJob = Jobs.findOne({ _id: Session.get('entityId') });
};

Template.jobDescription.rendered = function() {
  $('.bsTooltip').tooltip();
};

// Job description
var jobDescriptionEditMode = false;
var jobDescriptionEditModeDep = new Deps.Dependency;
var descriptionSelf={};
Utils.reactiveProp(descriptionSelf, 'previewMode', false);

Template.jobDescription.colorPreviewMode= function(){
  return descriptionSelf.previewMode ? '#008DFC' : ''
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
  return jobDescriptionEditMode ? '#008DFC' : '';
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
  'click .previewMode': function(){
    descriptionSelf.previewMode= ! descriptionSelf.previewMode;
  },

  'click #saveJobDescriptionEdit': function (e, ctx) {
    var update = ctx.data.getUpdate();
    if (!update.$set || !update.$set.jobDescription) {
      jobDescriptionEditMode = false;
      jobDescriptionEditModeDep.changed();
      return; // Nothing to update
    }

    Jobs.update({_id: Session.get('entityId')}, {$set: { jobDescription: update.$set.jobDescription }}, function (err, result) {
      if (!err) {
        jobDescriptionEditMode = false;
        jobDescriptionEditModeDep.changed();
        ctx.data.jobDescription.defaultValue =  ctx.data.jobDescription.value; // Reset jobDescription initial value
      }
    });
  }
};
