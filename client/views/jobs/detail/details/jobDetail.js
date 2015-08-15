schemaEditJob = new SimpleSchema({
  'jobTitle': {
    type: String,
    optional: false

  },
  'jobTitleDisplayName': {
    type: String,
    optional:true
  },
  'publicJobTitle': {
    type: String,
    optional:true
  },
  'rateQuote':{
    type: String,
    optional:true
  },
  'numberRequired':{
    type: Number,
    optional:true
  },
  'duration':{
    type: String,
    optional:true
  },
  'activeStatus':{
    type: String,
    optional:true
  },
  'status':{
    type: String,
    optional:true
  },
  'isWebVisible':{
    type: Boolean,
    optional:true
  },
  'statusNote':{
    type: String,
    optional:true
  },
  'availableShift':{
    type: String,
    allowedValues: ['1st shift','2nd shift','3rd shift'],
    optional:true
  }
})
var job = new ReactiveVar();

var self = {};
var editMode = new ReactiveVar(false);
var location = {};
Utils.reactiveProp(location, 'value', null);

Template.jobDetail.created = function () {
    editMode.set(false);
    this.autorun(function(){
      job.set(Jobs.findOne({ _id: Session.get('entityId')}))
    })
//  var originalJob = Jobs.findOne({ _id: Session.get('entityId') });
};

Template.jobDetail.destroyed = function () {

};

Template.jobDetail.helpers({
    job: function () {
      var reactJob = job.get();
      if(reactJob){
        var toReturn = {};
        toReturn._id = reactJob._id;
        toReturn.jobTitle = reactJob.jobTitle;
        toReturn.jobTitleDisplayName = reactJob.jobTitleDisplayName;
        toReturn.publicJobTitle = reactJob.publicJobTitle;
        toReturn.rateQuote = reactJob.rateQuote;
        toReturn.numberRequired = reactJob.numberRequired;
        toReturn.duration = reactJob.duration;
        toReturn.activeStatus = reactJob.activeStatus;
        toReturn.status = reactJob.status;
        toReturn.isWebVisible = reactJob.isWebVisible;
        toReturn.statusNote = reactJob.statusNote;
        toReturn.availableShift = reactJob.availableShift;
        return toReturn;
      }
    },
    buttonsActiveStatus: function(){
      var activeArray = LookUps.find({lookUpCode:Enums.lookUpCodes.active_status}).fetch();
      var arrayButtons = _.map(activeArray, function(a){
        return {displayName: a.displayName, value: a._id}
      })
      return arrayButtons;
    },
    buttonsStatus: function(){
      var activeArray = LookUps.find({lookUpCode:Enums.lookUpCodes.job_status}).fetch();
      var arrayButtons = _.map(activeArray, function(a){
        return {displayName: a.displayName, value: a._id}
      })
      return arrayButtons;
    },
    jobTitles: function(){
      var jobTitlesArray = LookUps.find({lookUpCode:Enums.lookUpCodes.job_titles}).fetch()
      var toReturn = _.map(jobTitlesArray, function(a){
        return {label: a.displayName, value: a._id}
      })
      return toReturn;
    },
    durations: function(){
      var jobDurations = LookUps.find({lookUpCode:Enums.lookUpCodes.job_duration}).fetch()
      var toReturn = _.map(jobDurations, function(a){
        return {label: a.displayName, value: a._id}
      })
      return toReturn;
    },
    getDuration: function(){
      var lkDuration = LookUps.findOne({_id: job.get().duration});
      if(lkDuration){
        return lkDuration.displayName;
      }
      else{
        return "Not set"
      }
    },
    getActiveStatus: function(){
      var lkActive = LookUps.findOne({_id: job.get().activeStatus});
      if(lkActive){
        return lkActive.displayName;
      }
      else{
        return "Not set"
      }
    },
    getStatus: function(){
      var lkStatus = LookUps.findOne({_id: job.get().status});
      if(lkStatus){
        return lkStatus.displayName;
      }
      else{
        return "Not set"
      }
    },
    originalJob: function () {
        return job.get();
    },
    editMode: function () {
        return editMode.get();
    },
    colorEdit: function () {
        return editMode.get() ? '#008DFC' : ''
    }
});

Template.jobDetail.events({
    'click .editJob': function () {
      editMode.set(!editMode.get());
    },
    'click .cancelButton': function () {
      editMode.set(false);

    }
});

AutoForm.hooks({
  updateJob: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      if(updateDoc.$set.jobTitle){
        var lkJobTitle = LookUps.findOne({_id: updateDoc.$set.jobTitle});
        updateDoc.$set.jobTitleDisplayName = lkJobTitle.displayName;
      }
      debugger;
      Meteor.call('updateJob',currentDoc._id,updateDoc, function(err, res){
        editMode.set(false);
      })
      return false;
    }
  }
})