
Meteor.methods({
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
});
