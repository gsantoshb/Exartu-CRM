Meteor.methods({
  addDeal: function (deal) {
    return DealManager.create(deal);
  },
  addDealQuote: function (dealId, quote) {
    DealManager.addQuote(dealId, quote);
  }
});