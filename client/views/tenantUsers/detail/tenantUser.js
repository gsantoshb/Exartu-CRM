TenantUserController = RouteController.extend({
  template: 'tenantUser',
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
    this.render('tenantUser')
  },
  onAfterAction: function () {

  }
});

Template.tenantUser.helpers({
  hierContext: function () {
    if (Session.get('hierId')) {
      var hier = Hierarchies.findOne(Session.get('hierId'));
      return hier;
    }
  }

});
Template.tenantUser.events = {
  'change .inactive': function (e) {
    TenantUsers.update({ _id: this._id }, { $set: { inactive: e.target.checked } });
  }
}