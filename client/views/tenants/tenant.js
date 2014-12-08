TenantController = RouteController.extend({
  template: 'tenant',
  layoutHier: 'mainLayout',
  waitOn: function () {
    return [HierarchiesHandler];
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

