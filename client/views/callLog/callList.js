
CallListController = RouteController.extend({
  layoutTemplate: 'mainLayout'
});
var handler = null;
Template.callList.created = function () {
  handler = handler || Meteor.paginatedSubscribe('callList');
};

Template.callList.rendered = function() {
};

Template.callList.destroyed = function () {
  handler && handler.stop();
  handler = null;
};

Template.callList.helpers({
  activities: function () {
    return Calls.find({},{sort: { dateCreated: -1 } });
  },
  logThis: function () {
    console.log(this);
  }
});
