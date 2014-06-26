var plan = {};

Template.subscriptionPlanTemplate.created = function() {
  plan = SubscriptionPlan.getUserPlan();
};

Template.freePlanSubscription.isFree = function () {
  return plan.code == SubscriptionPlan.plansEnum.free;
};

Template.enterprisePlanSubscription.isEnterprise = function () {
  return plan.code == SubscriptionPlan.plansEnum.enterprise;
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

Template.enterprisePlanSubscription.plan = function() {
  return SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.enterprise);
};

Template.enterprisePlanSubscription.tasksCount = function() {
  var firstDayOfMonth = new Date;
  firstDayOfMonth.setDate(1);
  return Tasks.find({
    createdAt: {
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