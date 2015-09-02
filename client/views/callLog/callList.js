
CallListController = RouteController.extend({
  layoutTemplate: 'mainLayout'
});

Template.callList.created = function () {
  this.subscribe('callList');
};

Template.callList.rendered = function() {
};

Template.callList.destroyed = function () {
};

Template.callList.helpers({
  activities: function () {
    return Calls.find({},{sort: { dateCreated: -1 } });
  },
  logThis: function () {
    console.log(this);
  }
});
