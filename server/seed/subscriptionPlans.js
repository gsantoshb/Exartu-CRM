seedSubscriptionPlans = function() {
  var plans = {
    free: {
      code: SubscriptionPlan.plansEnum.free,
      usersLimit: 6,
      collections: {
        Contactables: {
          limit: 200,
          type: SubscriptionPlan.collectionLimitTypes.forever
        },
        Jobs: {
          limit: 100,
          type: SubscriptionPlan.collectionLimitTypes.forever
        },
        Tasks: {
          blocked: true
        },
        ContactablesFS: {
          blocked: true
        },
        Messages: {
          limit: 100,
          type: SubscriptionPlan.collectionLimitTypes.forever
        }
      },
      storageLimit: 100 // Max megabytes of documents and profile pictures
    },
    enterprise: {
      code: SubscriptionPlan.plansEnum.enterprise,
      collections: {
        Tasks: {
          limit: 200,
          type: SubscriptionPlan.collectionLimitTypes.monthly
        }
      },
      storageLimit: 2000
    }
  };

  SubscriptionPlan.loadPlans(plans);
}
