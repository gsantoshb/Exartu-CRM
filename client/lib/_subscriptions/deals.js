Deals = new Meteor.Collection("deals", {
    transform: function (deal) {
        deal.displayName = deal.dealName;


        if (deal.customer) {
            var customer = Contactables.findOne({_id: deal.customer });
            deal.customerName = customer.displayName;
        }
        return deal;
    }
});
extendedSubscribe('deals', 'DealHandler');