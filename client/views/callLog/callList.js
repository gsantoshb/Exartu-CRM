
CallListController = RouteController.extend({
  layoutTemplate: 'mainLayout'
});
var handler = null;
var type = ReactiveVar();
var searchString = ReactiveVar();

Template.callList.created = function () {
  type.set(null);
  searchString.set('');

  this.autorun(function () {
    var filter = {};

    switch (type.get()){
      case 'inbound':
        filter.incoming = true;
        filter.voiceMail = { $ne: true };
        break;
      case 'outbound':
        filter.incoming = { $ne: true };
        break;
      case 'missed':
        filter.voiceMail = true;
        filter.voiceMailUrl = { $exists: false };
        break;
      case 'voiceMail':
        filter.voiceMailUrl = { $exists: true };
        break;
    }

    if (searchString.get()){
      filter.contactableName = { $regex: '.*' + searchString.get() + '.*', $options: 'i' }
    }

    if (handler){
      handler.setFilter(filter)
    } else {
      handler = Meteor.paginatedSubscribe('callList', { filter: filter});
    }
  });
};

Template.callList.destroyed = function () {
  handler && handler.stop();
  handler = null;
};

Template.callList.helpers({
  activities: function () {
    return Calls.find({},{sort: { dateCreated: -1 } });
  },
  callTypeOptions: function () {
    return [{
      displayName: 'Inbound',
      value: 'inbound'
    },{
      displayName: 'Outbound',
      value: 'outbound'
    },{
      displayName: 'Missed',
      value: 'missed'
    },{
      displayName: 'Voice Mail',
      value: 'voiceMail'
    }]
  },
  isSelectedClass: function () {
    if (type.get() != this.value){
      return 'btn-default';
    } else {
      return 'btn-primary';
    }
  },
  getDuration: function () {
    if (this.duration >= 60){
      return Math.ceil(this.duration / 60) + ' minutes';
    }else {
      return this.duration + ' seconds';
    }
  }
});

Template.callList.events({
  'click .type-filter': function (e, ctx) {
    if (type.get() == this.value){
      type.set(null);
    }else{
      type.set(this.value);
    }
  },
  'keyup #searchString': _.debounce(function (e, ctx) {
    searchString.set(e.target.value);
  }, 200)
});
