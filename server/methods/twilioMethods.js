
Meteor.methods({
  twilio_getCapabilityToken: function (clientName) {
    var capability = new Twilio.Capability(ExartuConfig.TW_accountSID, ExartuConfig.TW_authToken);
    capability.allowClientIncoming(clientName);
    capability.allowClientOutgoing(ExartuConfig.TW_appSID);
    return capability.generate(5000);
  },

  // Twilio calls
  twilioPlacementCall: function (placementId) {
    // Validate parameters
    check(placementId, String);

    try {
      return TwilioManager.makePlacementCall(placementId);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  }
  //
  //startWorkFlow: function(workFlowId){
  //  check(workFlowId, String);
  //  try {
  //    return TwilioManager.makeWorkFlowCall(workFlowId);
  //  } catch (err) {
  //    throw new Meteor.Error(err.message);
  //  }
  //}
});
