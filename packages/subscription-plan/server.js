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
            price: plan.price
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
//  Meteor.users.before.insert(function() {
//    if (!Meteor.user())
//      return;
//    var plan = SubscriptionPlan.getUserPlan();
//    if (plan.usersLimit && Meteor.users.find({hierId: Meteor.user().hierId}).count() >= plan.usersLimit)
//      throw new Meteor.Error(500, 'Limit users reached');
//  });

  // Collection's restrictions
  _.forEach(_.keys(Collections), function(collectionName) {
    var collection = Collections[collectionName];

    collection.before.insert(function(userId) {
      if (!userId)
        return;

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

    collection.before.update(function(userId) {
      if (!userId)
        return;

      var collectionPlan = getCollectionRestrictions(collectionName);
      if (collectionPlan && collectionPlan.blocked)
        throw new Meteor.Error(500, 'Data restricted for your current plan subscription');
    });

    collection.before.remove(function(userId) {
      if (!userId)
        return;

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

SubscriptionPlan.checkFunction = function(plans, fn) {
  return function() {
    if (SubscriptionPlan.isAllowed(plans))
      return fn.apply({}, arguments);
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

SubscriptionPlan.upgrade = function(hierId, planCode, amount, currency) {
  planCode = parseInt(planCode);

  var plan = SubscriptionPlans.findOne({code: parseInt(planCode)});

  if (!plan)
    throw new Meteor.Error(500, 'Payment plan is invalid');

  if (currency != 'USD')
    throw new Meteor.Error(500, 'Payment currency is invalid');

  if (amount != plan.price)
    throw new Meteor.Error(500, 'Payment amount is invalid');

  var hier = Hierarchies.findOne({_id: hierId});

  if (!hier)
    throw new Meteor.Error(500, 'Payment hierarchy is invalid');

  Hierarchies.update({_id: hierId}, {$set: { planCode: planCode} }, function(err) {
    if (!err)
      _.forEach(hier.users, function(userId){
        var user = Meteor.users.findOne({_id: userId});
        if(user && user.emails && user.emails[0]) {
          console.log('sending email');
          Email.send({
            to: user.emails[0].address,
            from: 'exartu.developer@gmail.com',
            subject: 'Exartu - Subscription upgrade!',
            html: 'Your account have been upgrade to Enterprise. Congratulations!'
          });
        }
      })
  });
};
