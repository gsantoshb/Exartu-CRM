TenantUserController = RouteController.extend({
  template: 'tenantUser',
  layoutUser: 'mainLayout',
  waitOn: function () {
    return [Meteor.subscribe('singleTenantUser', this.params._id)];
  },
  data: function () {
    Session.set('userId', this.params._id);
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
var user;
Template.tenantUser.helpers({
  userContext: function () {
    if (Session.get('userId')) {
      user = TenantUsers.findOne({_id: Session.get('userId')});
      return user;
    }
  },
  getUserName: function()
    {
      return Utils.getLocalUserName(user);
    },
  getUserEmail: function()
    {
      return user.emails[0].address;
    }

});
Template.tenantUser.events = {
  'change .inactive': function (e) {
    TenantUsers.update({ _id: this._id }, { $set: { inactive: e.target.checked } });
  }
};