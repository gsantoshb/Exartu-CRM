TestDataController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('testData');
  }
});

var isLoading = false,
  isLoadingDep = new Deps.Dependency;

Template.testData.helpers({
  isLoading: function () {
    isLoadingDep.depend();
    return isLoading;
  }
});

Template.testData.events({
  'click .injectData': function () {
    isLoading = true;
    isLoadingDep.changed();
    Deps.flush();

    Meteor.call('loadDemoData', function (err, result) {
      isLoading = false;
      isLoadingDep.changed();

      err && console.log(err);
    });
  },
  'click .removeData': function () {
    isLoading = true;
    isLoadingDep.changed();
    Deps.flush();
    Meteor.call('removeDemoData', function (err, result) {
      isLoading = false;
      isLoadingDep.changed();

      err && console.log(err);
    });
  }

});