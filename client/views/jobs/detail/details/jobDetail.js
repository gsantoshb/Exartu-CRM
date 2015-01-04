var jobCollections= Jobs;

var generateReactiveObject = function(job) {
  return new dType.objInstance(job, jobCollections);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.jobDetail.created=function(){
  self.editMode=false;
//  var originalJob = Jobs.findOne({ _id: Session.get('entityId') });
};
var job;
Template.jobDetail.destroyed = function(){
  job=null;
};

Template.jobDetail.helpers({
  job: function(){
    var originalJob = jobCollections.findOne({ _id: Session.get('entityId') });
    Session.set('jobDisplayName', originalJob.displayName);
    job = generateReactiveObject(originalJob);
    return job;
  },
  originalJob:function(){
    return jobCollections.findOne({ _id: Session.get('entityId') });
  },
  editMode:function(){
    return self.editMode;
  },
  colorEdit:function(){
    return self.editMode ? '#008DFC' : ''
  },
  isType:function(typeName){
    return !! jobCollections.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
  },
  jobCollection: function(){
    return jobCollections;
  },

  isSelected:function(optionValue, currentValue){
    return optionValue == currentValue;
  },
  location: function(){
    var originalJob = jobCollections.findOne({ _id: Session.get('entityId') });

    location.value= originalJob && originalJob.location;
    return location;
  },
  datePickerOptions: function () {
    return {
      format: "D, MM dd, yyyy",
      minViewMode: "days",
      startView: "months"
    }
  },
  fetchOptions: function () {
    return this.options.map(function (status) {
      return {id: status._id, text: status.displayName};
    });
  },
  onSelectedStatus: function () {
    return function (newStatus) {
      var ctx = Template.parentData(2);
      ctx.property._value = newStatus;
    }
  }
});

Template.jobDetail.events({
  'click .editJob':function(){
    self.editMode= ! self.editMode;
  },
  'click .saveDetailsButton':function(){
    if (!job.validate()) {
      job.showErrors();
      return;
    }
    var update= job.getUpdate();

    jobCollections.update({_id: job._id}, update, function(err, result) {
      if (!err) {
        self.editMode=false;
        job.reset();
      }
      else
      {
        alert(err);
      }
    });
  },
  'click .cancelButton':function(){
    self.editMode=false;
  }
});


Template.jobDetail.helpers({
  getType: function(){
    return Enums.linkTypes.job;
  }
});


