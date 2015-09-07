TwilioManager = {};

Meteor.startup(function () {
  $.cachedScript( "https://static.twilio.com/libs/twiliojs/1.2/twilio.js" ).done(function( script, textStatus ) {
    TwilioManager.setupTwilioDevice();
  });
});
currentTwilioConnection = new ReactiveVar();

_.extend(TwilioManager, {
  setupTwilioDevice: function () {
    // Set up the Twilio Device
    setupConnection();

    Twilio.Device.ready(function (device) { console.log("Twilio ready"); });

    //This is triggered when an incoming connection is canceled by the caller before it is accepted by the Twilio Client device.
    Twilio.Device.cancel(function (conn) {
      currentTwilioConnection.set(undefined);
    });

    //Register a handler function to be called when any device error occurs. These may be errors in your request, your capability token, connection errors, or other application errors
    Twilio.Device.error(function (error) {
      console.log(error.message);
    });

    //This is triggered when the connection to Twilio drops or the device's capability token is invalid/expired.
    Twilio.Device.offline(function (device) {
      //Then reconnect
      setupConnection();
    });

    //This is triggered whenever an incoming connection from an outbound REST call or a TwiML <Dial> to this device is made.
    Twilio.Device.incoming(function (conn) {
      console.log("Incoming connection from " + conn.parameters.From);
      currentTwilioConnection.set(conn);
      conn.disconnect(function (conn) {
        currentTwilioConnection.set(undefined);
      });
      Utils.showModal('incomingCallModal');
    });
  }
});


var setupConnection = function () {
  Meteor.call('twilio_getCapabilityToken', Meteor.userId(), function (err, res) {
    if (err) {
      console.log('There was an error setting up the Twilio Device.', err.message);
    } else {
      Twilio.Device.setup(res, {debug: true, closeProtection: true});
    }
  });
};

