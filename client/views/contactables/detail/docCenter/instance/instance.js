InstanceController = RouteController.extend({
  layoutTemplate: 'mainLayout',

  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable')
      return;
    }
    this.render('docInstance')
  }
});

Template.docInstance.helpers({});

Template.docInstance.events({});