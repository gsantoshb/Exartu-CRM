
var generateReactiveObject = function(job) {
  return new dType.objInstance(job, Jobs);
};

var self={};
Utils.reactiveProp(self, 'editMode', false);
var location={};
Utils.reactiveProp(location, 'value', null);

Template.jobDetail.created=function(){
  self.editMode=false;
//  var originalJob = Jobs.findOne({ _id: Session.get('entityId') });
}
var job;

Template.jobDetail.helpers({
  job: function(){
    var originalJob = Jobs.findOne({ _id: Session.get('entityId') });
    Session.set('jobDisplayName', originalJob.displayName);
    if (!job)
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

  isSelected:function(optionValue, currentValue){
    return optionValue == currentValue;
  },
  location: function(){
    var originalJob = Jobs.findOne({ _id: Session.get('entityId') });

    location.value= originalJob && originalJob.location;
    return location;
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
    var update=job.getUpdate();
    var originalJob=Jobs.findOne({ _id: Session.get('entityId') });
    var oldLocation= originalJob.location;
    var newLocation= location.value;

    if ((newLocation && newLocation.displayName) != (oldLocation && oldLocation.displayName)){
      update.$set = update.$set || {};
      update.$set.location = newLocation;
    }

    Jobs.update({_id: job._id}, update, function(err, result) {
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


