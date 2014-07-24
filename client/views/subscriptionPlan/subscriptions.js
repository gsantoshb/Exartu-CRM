var stripeHandler = {};

Template.subscriptionPlanTemplate.created = function() {
  var stripePublishableKey = SystemConfigs.findOne({ configName: 'stripePublishableKey' });
  stripeHandler = StripeCheckout.configure({
    key: stripePublishableKey.configValue,
    image: '/assets/logo.png',
    allowRememberMe: false,
    token: function(token) {
      Meteor.call('stripeCheckout', Meteor.user().hierId, token.id);
    }
  });
};

Template.subscriptionPlanTemplate.plan = function() {
  return SubscriptionPlan.getUserPlan();
};

Template.freePlanSubscription.isFree = function () {
  return SubscriptionPlan.getUserPlan().code == SubscriptionPlan.plansEnum.free;
};

Template.enterprisePlanSubscription.isEnterprise = function () {
  return SubscriptionPlan.getUserPlan().code == SubscriptionPlan.plansEnum.enterprise;
};

Template.freePlanSubscription.plan = function() {
  return SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.free);
};

Template.freePlanSubscription.storageUsed = function() {
  return Math.round(SubscriptionPlan.storageUsed() * 100) / 100;
};

Template.freePlanSubscription.getPercentageStorageUsed = function() {
  return Math.round(SubscriptionPlan.getPercentageStorageUsed() * 100) / 100;
};

Template.freePlanSubscription.contactablesCount = function() {
  return Contactables.find().count();
};

Template.freePlanSubscription.jobsCount = function() {
  return Jobs.find().count();
};

Template.freePlanSubscription.messagesCount = function() {
  return Messages.find().count();
};

Template.freePlanSubscription.usersCount = function() {
  return Meteor.users.find().count();
};

Template.freePlanSubscription.tasksCount = function() {
  return Tasks.find().count();
};

Template.enterprisePlanSubscription.events({
  'click #stripeCheckout': function(e) {
    debugger;
    stripeHandler.open({
      name: 'Exartu',
      description: 'Enterprise ($20.00)',
      amount: SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.enterprise).price * 100,
      currency: 'USD'
    });
    e.preventDefault();
  }
});

Template.enterprisePlanSubscription.plan = function() {
  return SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.enterprise);
};

Template.enterprisePlanSubscription.tasksCount = function() {
  var firstDayOfMonth = new Date;
  firstDayOfMonth.setDate(1);
  return Tasks.find({
    dateCreated: {
      $gt: firstDayOfMonth
    }
  }).count();
};

Template.enterprisePlanSubscription.storageUsed = function() {
  return Math.round(SubscriptionPlan.storageUsed() * 100) / 100;
};

Template.enterprisePlanSubscription.getPercentageStorageUsed = function() {
  return Math.round(SubscriptionPlan.getPercentageStorageUsed() * 100) / 100;
};