JobController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [JobHandler, ObjTypesHandler, GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action:function(){
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('job')
    },
  onAfterAction: function() {
    var title = 'Jobs / ' + Session.get('jobDisplayName'),
      description = 'Job information';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

var generateReactiveObject = function(job) {
  return new dType.objInstance(job, Jobs);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);
var services;

Template.job.created=function(){
  self.editMode=false;
  var originalJob=Jobs.findOne({ _id: Session.get('entityId') });


  var definition={
    reactiveProps:{
      tags:{
        default: originalJob.tags,
        update: 'tags',
        type: Utils.ReactivePropertyTypes.array
      }
    }
  };
  services= Utils.ObjectDefinition(definition);
}

Template.job.helpers({
  job: function(){
    var originalJob=Jobs.findOne({ _id: Session.get('entityId') });
    Session.set('jobDisplayName', originalJob.displayName);
    job = generateReactiveObject(originalJob);
    return job;
  },
  originalJob:function(){
    return Jobs.findOne({ _id: Session.get('entityId') });
  },
  editMode:function(){
      return self.editMode;
  },
  colorEdit:function(){
      return self.editMode ? '#008DFC' : '#ddd'
  },
  isType:function(typeName){
    return !! Jobs.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  jobCollection: function(){
    return Jobs;
  },
  getCustomer:function(){
    var j=Jobs.findOne({ _id: Session.get('entityId')});
    return j && j.customer;
  },
  noteCount: function() {
      return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
  },
  isSelected:function(optionValue, currentValue){
      return optionValue == currentValue;
    },
  location: function(){
    var originalJob=Jobs.findOne({ _id: Session.get('entityId') });

    location.value= originalJob && originalJob.location;
    return location;
  },
  tags: function(){
    return services.tags;
  }
});

Template.job.events({
  'click .editJob':function(){
      self.editMode= ! self.editMode;
  },
  'click .saveButton':function(){
    if (!job.validate()) {
      job.showErrors();
      return;
    }
    var update=job.getUpdate();
    var originalJob=Jobs.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalJob.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set= update.$set || {};
      update.$set.location= newLocation;
    }

    if (services.tags.value.length > 0)
      update.$set.tags = services.tags.value;

    Jobs.update({_id: job._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        job.reset();
      }
    });
  },
  'click .cancelButton':function(){
      self.editMode=false;
  },
  'click .add-tag': function() {
    addTag();
  },
  'keypress #new-tag': function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      addTag();
    }
  },
  'click .remove-tag': function() {
    services.tags.remove(this.value);
  }
});

var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(services.tags.value, inputTag.value) != -1)
    return;
  services.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
};

Template.job_tabs.helpers({
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
  'click #saveJobDescriptionEdit':function() {
    var update = job.getUpdate();
    if (!update.$set || !update.$set.jobDescription) {
      jobDescriptionEditMode = false;
      jobDescriptionEditModeDep.changed();
      return; // Nothing to update
    }

    Jobs.update({_id: job._id}, {$set: { jobDescription: update.$set.jobDescription }}, function(err, result) {
      if (!err) {
        jobDescriptionEditMode = false;
        jobDescriptionEditModeDep.changed();
        job.jobDescription.defaultValue = job.jobDescription.value; // Reset jobDescription initial value
      }
    });
  },
  'click .previewMode': function(){
    descriptionSelf.previewMode= ! descriptionSelf.previewMode;
  }
};