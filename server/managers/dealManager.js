DealManager = {
  create: function(deal) {
    return Deals.insert(deal);
  },
  addQuote: function() {
    // TODO: validations
    quote.userId = Meteor.userId();
    quote.dateCreated = Date.now();
    Deals.update({
      _id: dealId
    }, {
      $addToSet: {
        quotes: quote
      }
    });
  }
};