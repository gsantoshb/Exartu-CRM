TwilioManagementController = RouteController.extend({
  template: 'twilioManagement',
  onAfterAction: function() {
    var title = 'Settings',
      description = 'Twilio management';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('twilioManagement');
  }
});

Template.twilioManagement.helpers({
  hierarchy: function () {
    return Hierarchies.findOne(Meteor.user().currentHierId);
  }
});

Template.twilioManagement.events({
  'click #require-number': function () {
    var self = this;
    Utils.showModal('basicModal', {
      title: 'Require phone number for hierarchy' +  this.name,
      message: 'Request phone number for this hierarchy?',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {label: 'Request', classes: 'btn-success', value: true}],
      callback: function (result) {
        if (result) {
          Meteor.call('createHierarchyNumber', self._id);
        }
      }
    });
  }
});