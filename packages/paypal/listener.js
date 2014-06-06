/*
Defines the IPN Listener
 */


// cb: a function that should verify that the amount and the currency of the payment is correct for the item
// arguments: amount, currency, item_name, item_number, custom info
// if you prefer you have all the data of the payment available in 'this' like described in https://developer.paypal.com/docs/classic/ipn/integration-guide/IPNandPDTVariables/#id091EB04C0HS
// return: if you find an error you should return a message, that way the payment will be saved as an invalid one
//      with the corresponding invalidation message. If you return a falsy value the payment will be saved as a valid payment

//example:

//paypal.registerHandler('IPNhandlerURL',function(amount, currency, item_name, item_number, custom){
//  var user=getUser(custom);
//  var item=getItem(item_number);
//  if(item.price!=amount){
//    throw 'Somebody is trying to rob me!!'
//  }
//  someBodyHasPayedMe(user, item);
//
//})
var verified='VERIFIED';

var payments=new Meteor.Collection('payments');
var invalidPayments=new Meteor.Collection('invalidPayments');

paypal={
  registerHandler: function(path, cb){
    if(!_.isString(path)) return;
    if(!_.isFunction(cb)) return;


    Router.map(function () {
      this.route('route', {
        path: path,
        where: 'server',
        action: function() {
          console.log('\n\n*****  request from paypal received  *****\n\n')
          if (this.request.method == 'POST') {
            this.response.writeHead(200);
            respondeIPNMessage(this.request, cb);
          } else {
            this.response.writeHead(405);
          }
          return this.response.end()
        }
      })
    });
  }
};


var respondeIPNMessage=function(request, cb){
  var body= request.body;
  var result='cmd=_notify-validate'


  _.each(_.keys(body),function(key){
    result=result + '&' + key + '=' + body[key];
  })

  console.log('result:\n')
  console.log(result)
  console.log('\n')
  console.log('posting...')

  HTTP.post('https://www.sandbox.paypal.com/cgi-bin/webscr',{
    query: result
  }, function(err, result){

    if (!err) {
      processPayment(request, cb, result)

    }else{
      console.log('Error')
      console.dir(err)
    }
  })
}

var processPayment= function(request, cb, result){
  var data=request.body;

  if(! result.content == verified){
    invalidPayments.insert({ ipn: data, invalidation:'Not Verified' });
    return;
  }

  if (data.payment_status != 'Completed'){
    payments.insert(data);
    return;
  }

  var duplicated= payments.findOne({txn_id: data.txn_id, payment_status: data.payment_status})

  if (duplicated)
    return;

  if(paypalAccountEmail != data.receiver_email){
    invalidPayments.insert({ ipn: data, invalidation:'The receiver_email is not ours (' + paypalAccountEmail + ')' });
  }

  if (!cb){
    payments.insert(data);
    return;
  }

  try{
    cb.call(data, data.mc_gross, data.mc_currency, data.item_name, data.item_number, data.custom);
    payments.insert(data);
  }catch (e){
    invalidPayments.insert({ ipn: data, invalidation: e.reason || e.message });
  }
}
var paypalAccountEmail=null
Meteor.startup(function(){
  paypalAccountEmail=process.env.paypalAccountEmail;
  if(!paypalAccountEmail){
    console.log('paypalAccountEmail NOT set')
  }else{
    console.log('paypalAccountEmail configured correctly')
  }
})