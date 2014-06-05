/*
Defines the IPN Listener
 */

Router.map(function () {
  this.route('route', {
    path: '/paypal',
    where: 'server',
    action: function() {
      console.log('\n\n*****  request from paypal received  *****\n\n')
      if (this.request.method == 'POST') {
        this.response.writeHead(200);
        respondeIPNMessage(this.request);
      } else {
        this.response.writeHead(404);
      }
      return this.response.end(this.request)
    }
  })
});
var respondeIPNMessage=function(request){
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

    if (!error) {
      console.dir(result)
    }else{
      console.log('Error')
      console.dir(error)
    }
  })
}