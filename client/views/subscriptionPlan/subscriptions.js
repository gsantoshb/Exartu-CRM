var stripeHandler = {};

Template.subscriptionPlanTemplate.created = function () {
  var stripePublishableKey = SystemConfigs.findOne({configName: 'stripePublishableKey'});
  stripeHandler = StripeCheckout.configure({
    key: stripePublishableKey.configValue,
    image: '/assets/logo.png',
    allowRememberMe: false,
    token: function (token) {
      Meteor.call('stripeCheckout', Meteor.user().hierId, token.id);
    }
  });
};

Template.subscriptionPlanTemplate.helpers({
  plan: function () {
    return SubscriptionPlan.getUserPlan();
  },
  isEnterprise: function () {
    return SubscriptionPlan.getUserPlan().code == SubscriptionPlan.plansEnum.enterprise;
  }
});

Template.freePlanSubscription.helpers({
  isFree: function () {
    return SubscriptionPlan.getUserPlan().code == SubscriptionPlan.plansEnum.free;
  },
  plan: function () {
    return SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.free);
  },
  storageUsed: function () {
    return Math.round(SubscriptionPlan.storageUsed() * 100) / 100;
  },
  getPercentageStorageUsed: function () {
    return Math.round(SubscriptionPlan.getPercentageStorageUsed() * 100) / 100;
  },
  contactablesCount: function () {
    return Contactables.find().count();
  },
  jobsCount: function () {
    return Jobs.find().count();
  },
  messagesCount: function () {
    return Messages.find().count();
  },
  usersCount: function () {
    return Meteor.users.find().count();
  },
  tasksCount: function () {
    return Tasks.find().count();
  }
});


Template.enterprisePlanSubscription.helpers({
  tasksCount: function () {
    var firstDayOfMonth = new Date;
    firstDayOfMonth.setDate(1);
    return Tasks.find({
      dateCreated: {
        $gt: firstDayOfMonth
      }
    }).count();
  },
  plan: function () {
    return SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.enterprise);
  },
  storageUsed: function () {
    return Math.round(SubscriptionPlan.storageUsed() * 100) / 100;
  },
  getPercentageStorageUsed: function () {
    return Math.round(SubscriptionPlan.getPercentageStorageUsed() * 100) / 100;
  }
});


Template.enterprisePlanSubscription.events({
  'click #stripeCheckout': function (e) {
    stripeHandler.open({
      name: 'Exartu',
      description: 'Enterprise ($20.00)',
      amount: SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.enterprise).price * 100,
      currency: 'USD'
    });
    e.preventDefault();
  }
});