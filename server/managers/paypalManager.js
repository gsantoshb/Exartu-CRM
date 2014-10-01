Meteor.startup(function(){
  paypal.registerHandler('paypal', function(amount, currency, item_name, item_number, custom){
    SubscriptionPlan.upgrade(custom, item_number, amount, currency);
  });
});