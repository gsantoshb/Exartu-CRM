Meteor.methods({
    twilio_getCapabilityToken: function (clientName) {
        var capability = new Twilio.Capability(ExartuConfig.TW_accountSID, ExartuConfig.TW_authToken);
        capability.allowClientIncoming(clientName);
        var token = capability.generate();
        return token;
    }
});
