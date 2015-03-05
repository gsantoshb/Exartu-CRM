SubscriptionPlan = {};

SubscriptionPlans = new Mongo.Collection('subscriptionPlans');

SubscriptionPlan.plansEnum = {
  free: 0,
  enterprise: 1
};

SubscriptionPlan.getUserPlan = function() {
  var user = Meteor.users.findOne({_id: Meteor.userId()});
//  console.dir(user);

  var hier = Hierarchies.findOne({_id: user.currentHierId});
    console.log('user',user);

  if(!hier)
    throw new Meteor.Error(404, 'Hierarchy not found');

  var plan = SubscriptionPlans.findOne({code: hier.planCode});
  if (!plan)
    throw new Meteor.Error(500, 'Hierarchy without subscription plan');

//  console.dir(plan);

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

