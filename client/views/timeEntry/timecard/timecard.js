
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
    return Placements.findOne(this.placementId);
  }
});
