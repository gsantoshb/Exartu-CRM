TwilioManager = {};
currentTwilioConnection = new ReactiveVar();

_.extend(TwilioManager, {
        startReceivingCalls: function () {
            setupConnection();
            Twilio.Device.ready(function (device) {
                console.log("Twilio ready");
            });
            //This is triggered when an incoming connection is canceled by the caller before it is accepted by the Twilio Client device.
            Twilio.Device.cancel(function (conn){
                currentTwilioConnection.set(undefined);
            });
            //Register a handler function to be called when any device error occurs. These may be errors in your request, your capability token, connection errors, or other application errors
            Twilio.Device.error(function (error) {
                console.log(error);
            });
            //This is triggered when the connection to Twilio drops or the device's capability token is invalid/expired.
            //Then reconnect.
            Twilio.Device.offline(function (device) {
                setupConnection();
            });
            //This is triggered whenever an incoming connection from an outbound REST call or a TwiML <Dial> to this device is made.
            Twilio.Device.incoming(function (conn) {
                console.log("Incoming connection from " + conn.parameters.From);
                Utils.showModal('incomingCallModal', conn);
                currentTwilioConnection.set(conn);
            });
 }});


var setupConnection = function(){
    Meteor.call('twilio_getCapabilityToken', Meteor.userId(),function(err,res){
        Twilio.Device.setup(res);
    });
}

