TenantController = RouteController.extend({
  template: 'tenant',
  layoutHier: 'mainLayout',
  waitOn: function () {
    return [TenantsHandler];
  },
  data: function () {
    Session.set('hierId', this.params._id);
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
  hierContext: function () {
    if (Session.get('hierId')) {
      var hier = Hierarchies.findOne(Session.get('hierId'));
      return hier;
    }
  }

});
Template.tenant.events = {
  'change .inactive': function (e) {
    Tenants.update({ _id: this._id }, { $set: { inactive: e.target.checked } });
  }
}