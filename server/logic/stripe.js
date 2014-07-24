/* Subscription charge through Stripe  */

Meteor.startup(function () {
  Meteor.methods({
    stripeCheckout: function (hierId, token) {
      var stripeSecretKey = SystemConfigs.findOne({ configName: 'stripeSecretKey' });
      var Stripe = StripeAPI(stripeSecretKey.configValue);
      Stripe.charges.create({
        amount: SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.enterprise).price * 100,
        currency: 'USD',
        card: token,
        description: 'Enterprise ($20.00)'
      }, Meteor.bindEnvironment(function (err, res) {
        if (err) {
          if (err.type === 'StripeCardError')
            return { status: 'error', message: 'The card has been declined', res: res};
          return { status: 'error', message: 'The payment could not be processed', res: res};
        } else {
          SubscriptionPlan.upgrade(hierId, SubscriptionPlan.plansEnum.enterprise, SubscriptionPlan.getPlan(SubscriptionPlan.plansEnum.enterprise).price, 'USD');
          return { status: 'ok' };
        }
      }));
    }
  });
});
