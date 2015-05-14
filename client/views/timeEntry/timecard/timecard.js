
var timecard = new ReactiveVar();
TimeCardController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'timecard',
  waitOn: function () {
    return Meteor.subscribe('timecardInfo', this.params.id);
  },
  action: function () {
    timecard.set(Timecards.findOne({_id: this.params.id}));
    this.render();
  }
});


var error = new ReactiveVar(''),
    isSubmitting = new ReactiveVar(false);

Template.timecard.helpers({
  isSubmitting: function () {
    return isSubmitting.get();
  },
  error: function () {
    return error.get();
  },
  timecard: function () {
    return timecard.get();
  },
  placement: function () {
    if (timecard.get()){
      return Placements.findOne(timecard.get().placementId);
    }
  },
  jobDisplayName: function () {
    var job =  Jobs.findOne(this.job);
    return job && job.displayName;
  },
  clientId: function () {
    var job =  Jobs.findOne(this.job);
    var client = job && Contactables.findOne(job.client);
    return client && client._id;
  },
  clientDisplayName: function () {
    var job =  Jobs.findOne(this.job);
    var client = job && Contactables.findOne(job.client);
    return client && client.displayName;
  },
  getType: function(typeId){
    return LookUps.findOne({lookUpCode: Enums.lookUpTypes.placement.rate.lookUpCode, _id: typeId});
  },
  round: function(value){
    return Math.round(value * 100) / 100;
  }
});


AutoForm.hooks({
  editTimecardForm: {
    onSubmit: function(insertDoc) {
      var self = this;

      // Clean schema for auto and default values
      TimecardSchema.clean(insertDoc);

      // Clear error message
      error.set('');

      // Insert education
      isSubmitting.set(true);
      Meteor.call('updateTimecard', timecard.get()._id, insertDoc, function (err) {
        isSubmitting.set(false);
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          error.set('Server error. ' + msg);
        } else {
          self.done();
          // Show notification
          $.gritter.add({
            title:	'Timecard updated',
            text:	'Your changes have been successfully saved.',
            image: 	'/img/logo.png',
            sticky: false,
            time: 2000
          });
        }
      });

      return false;
    }
  }
});