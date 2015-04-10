
Template.jobDescription.rendered = function() {
  Template.instance().$('.bsTooltip').tooltip();
};

// Job description
var previewMode = new ReactiveVar(false);
var editMode = new ReactiveVar(false);

Template.jobDescription.helpers({
  previewMode: function () {
    return previewMode.get();
  },
  editMode: function () {
    return editMode.get();
  },
  jobDescription: function () {
    return Jobs.findOne({_id: Session.get('entityId')}).jobDescription;
  }
});

Template.jobDescription.events = {
  'click .toggleEditMode': function(){
    editMode.set(!editMode.get());
  },
  'click .previewMode': function(){
    previewMode.set(!previewMode.get());
  },

  'click #saveJobDescriptionEdit': function (e, ctx) {
    var text = WYSIHTMLEditor.getValue();
    if (text)
      Jobs.update({_id: Session.get('entityId')}, {$set: {jobDescription: text}}, function (err, result) { });

    editMode.set(false);
  }
};
