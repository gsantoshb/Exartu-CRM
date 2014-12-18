TenantController = RouteController.extend({
  template: 'tenant',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [Meteor.subscribe('singleTenant', this.params._id)];
  },
  data: function () {
    Session.set('tenantId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('tenant')
  },
  onAfterAction: function () {

  }
});

Template.tenant.helpers({
  tenantContext: function () {
    if (Session.get('tenantId')) {
      var tenant = Tenants.findOne(Session.get('tenantId'));
      return tenant;
    }
  }

});
Template.tenant.events = {
  'change .inactive': function (e) {
    Tenants.update({ _id: this._id }, { $set: { inactive: e.target.checked } });
  }
}