GetContactCSVController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  action: function () {
    this.render('getContactCSV')
  }
});
var data = new ReactiveVar();

Template.getContactCSV.created = function () {
  Meteor.call('getContactCSV', function (err, result) {
    if (err){
      console.error(err);
      return;
    }
    data.set(result);
  })
};
Template.getContactCSV.helpers({
  data: function () {
    return data.get();
  }
});

Template.getContactCSV.events({});