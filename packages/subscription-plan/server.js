Meteor.publish('subscriptionPlans', function() {
  return SubscriptionPlans.find();
});

function deny() { return true};

SubscriptionPlans.deny({
  insert: deny,
  update: deny,
  remove: deny
});

SubscriptionPlan.collectionLimitTypes = {
  monthly: 0,
  forever: 1
};

SubscriptionPlan.loadPlans = function(plans) {
  _.forEach(plans, function(plan){
    var oldPlan = SubscriptionPlans.findOne({code: plan.code});
    if (!oldPlan )
      SubscriptionPlans.insert(plan);
    else
      SubscriptionPlans.update({_id: oldPlan ._id},
        {
          $set: {
            code: plan.code,
            collections: plan.collections,
            methods: plan.methods,
            storageLimit: plan.storageLimit,
            usersLimit: plan.usersLimit,
          }
        }
      );
  });
}

Meteor.startup(function() {
  function getCollectionRestrictions(collectionName) {
    var plan = SubscriptionPlan.getUserPlan();
    return plan.collections[collectionName];
  };

  // Users restrictions
  Meteor.users.before.insert(function() {
    if (!Meteor.user())
      return;
    var plan = SubscriptionPlan.getUserPlan();
    console.log(Meteor.users.find({hierId: Meteor.user().hierId}).count());
    if (plan.usersLimit && Meteor.users.find({hierId: Meteor.user().hierId}).count() >= plan.usersLimit)
      throw new Meteor.Error(500, 'Limit users reached');
  });

  // Collection's restrictions
  _.forEach(_.keys(Collections), function(collectionName) {
    var collection = Collections[collectionName];

    collection.before.insert(function() {
      var collectionPlan = getCollectionRestrictions(collectionName);

      if (!collectionPlan)
        return;

      if (collectionPlan.blocked)
        throw new Meteor.Error(500, 'Data restricted for your current plan subscription');

      // Count restrictions
      var q = {
        hierId: Meteor.user().hierId
      };

      if (collectionPlan.type == SubscriptionPlan.collectionLimitTypes.monthly) {
        var firstDayOfMonth = new Date;
        firstDayOfMonth.setDate(1);
        q.createdAt = {
          $gt: firstDayOfMonth
        };
      }

      var count = collection.find(q).count();
      if (count >= collectionPlan.limit)
        throw new Meteor.Error(500, 'Your hierarchy has reached max count of items in ' + collectionName);
    });

    collection.before.update(function() {
      var collectionPlan = getCollectionRestrictions(collectionName);
      if (collectionPlan && collectionPlan.blocked)
        throw new Meteor.Error(500, 'Data restricted for your current plan subscription');
    });

    collection.before.remove(function() {
      var collectionPlan = getCollectionRestrictions(collectionName);
      if (collectionPlan && collectionPlan.blocked)
        throw new Meteor.Error(500, 'Data restricted for your current plan subscription');
    });
  })

  // Storage restrictions
  _.forEach(Document.collections, function(documentCollection) {
    var collection = documentCollection.getCollection();
    collection.before.insert(function() {
      SubscriptionPlan.checkStorage();
    });
  });

});

SubscriptionPlan.checkFunction = function(options, fn) {
  if (SubscriptionPlan.isAllowed(options.plans))
    return fn;

  return function() {
    throw new Meteor.Error(500, 'Function not included in users plan subscription');
  };
};

SubscriptionPlan.checkStorage = function() {
  var plan = SubscriptionPlan.getUserPlan();
  if (!plan.storageLimit)
    return;

  if (SubscriptionPlan.storageUsed() >= plan.storageLimit)
    throw new Meteor.Error(500, 'Storage limit reached');
};
