Meteor.startup(function(){
  paypal.registerHandler('paypal',function(amount, currency, item_name, item_number, custom){
    console.dir('custom')
    console.dir(custom)
    Hierarchies.update({ _id: custom },{ $set: { pay: amount } });
  })
})