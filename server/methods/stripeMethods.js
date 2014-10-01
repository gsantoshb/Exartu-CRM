Meteor.methods({
  stripeCheckout: function (hierId, token) {
    StripeManager.stripeCheckout(hierId, token);
  }
});