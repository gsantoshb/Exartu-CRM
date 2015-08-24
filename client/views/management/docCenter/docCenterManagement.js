DocCenterManagementController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('docCenterManagement');
  }
});
var isLoading = new ReactiveVar(),
  isRegistered = new ReactiveVar(),
  isActivating = new ReactiveVar(),
  showPass = new ReactiveVar();


var getCredentials = function () {
  isLoading.set(true);
  DocCenter.getCredentials(function (result) {
    isRegistered.set(result);
    isLoading.set(false);
  })
};

Template.docCenterManagement.created = function () {
  showPass.set(false);
  isActivating.set(false);
  getCredentials();
};

Template.docCenterManagement.helpers({
  isRegistered: function () {
    return isRegistered.get();
  },
  isLoading: function () {
    return isLoading.get();
  },
  showPass: function () {
    return showPass.get();
  },
  isActivating: function () {
    return isActivating.get();
  },
  kioskNotification: function () {
    if(Meteor.user().kioskNotification)
      return 'checked';
    else
      return '';
  }
});

Template.docCenterManagement.events({
  'click #activateDocCenter': function (e, ctx) {
    isActivating.set(true);
    Meteor.call('registerOnDocCenter', function (err, result) {
      isActivating.set(false);
      if (err){
        console.log(err);
      }
      getCredentials();

    })
  },
  'click #showPass': function () {
    showPass.set(true);
  },
  'click #setKioskNotification': function (e) {
    if ($(e.currentTarget).prop('checked')) {
      Meteor.call('setUserKioskNotification', true);
    } else {
      Meteor.call('setUserKioskNotification', false);
    }
  }
});