SubscriptionPlan = {};

SubscriptionPlans = new Meteor.Collection('subscriptionPlans');

SubscriptionPlan.plansEnum = {
  free: 0,
  enterprise: 1
};

SubscriptionPlan.getUserPlan = function() {
  var user = Meteor.users.findOne({_id: Meteor.isServer? Meteor.userId: Meteor.userId()});

  var hier = Hierarchies.findOne({_id: user.hierId});
    if(!hier)
    throw new Meteor.Error(404, 'Hierarchy not found');

  var plan = SubscriptionPlans.findOne({code: hier.planCode});
  if (!plan)
    throw new Meteor.Error(500, 'Hierarchy without subscription plan');

  return plan;
};

SubscriptionPlan.isAllowed = function(plans) {
  return _.indexOf(plans, SubscriptionPlan.getUserPlan().code) != -1;
};

SubscriptionPlan.storageUsed = function() {
  var totalStorageUsed = 0;
  _.forEach(Document.collections, function(documentCollection) {
    totalStorageUsed += documentCollection.getCollectionSize();
  });

  return totalStorageUsed / (1024*1024);
};

SubscriptionPlan.getPlan = function(planCode) {
  return SubscriptionPlans.findOne({code: planCode});
}

