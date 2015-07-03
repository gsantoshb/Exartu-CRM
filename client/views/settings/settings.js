
SettingsController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'settings'
});

Template.settings.helpers({
  isAdmin: function () {
    return Utils.bUserIsAdmin();
  }
});
