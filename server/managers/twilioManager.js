
TwilioManager = {
  makePlacementCall: function (placementId) {
    // Validate parameters
    if (!placementId) throw new Error("Placement ID is required");

    // Get placement
    var placement = Utils.filterCollectionByUserHier2(Meteor.userId(), Placements.find({_id: placementId})).fetch()[0];
    if (!placement) throw new Error("Invalid placement ID");

    // Get employee
    var employee = Utils.filterCollectionByUserHier2(Meteor.userId(), Contactables.find({_id: placement.employee})).fetch()[0];
    if (!employee.contactMethods || employee.contactMethods.length == 0) throw new Error("Employee needs a phone contact method");

    // Get employee phone number
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    var phoneCMs = _.pluck(LookUps.find({
      hierId: rootHier,
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: Enums.lookUpAction.ContactMethod_Phone
    }).fetch(), '_id');
    var phone = _.find(employee.contactMethods, function (cm) {return phoneCMs.indexOf(cm.type) != -1;});
    if (!phone) throw new Error("Employee needs a phone contact method");

    // Get job
    var job = Utils.filterCollectionByUserHier2(Meteor.userId(), Jobs.find({_id: placement.job})).fetch()[0];
    if (!job.address) throw new Error("The job needs a worksite");

    // Get job address
    var address = Addresses.findOne({_id: job.address});
    if (!address) throw new Error("The job needs a worksite");


    // Get hierarchy phone number
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    var hier = Hierarchies.findOne({_id: rootHier});
    if (!hier.phoneNumber || !hier.phoneNumber.value) throw new Error("Hierarchy phone number is required");

    // Check twilio credentials
    if (!twilio) throw new Error("Twilio account credentials not set");

    // Craft the url
    var callUrl = "https://hrckiosk.ngrok.io/" + "twilio/placementCall?id=" + placement._id;

    // Make the twilio call
    twilio.makeCall({
      to:'+16519680123', // Any number Twilio can call
      from: hier.phoneNumber.value, // A number you bought from Twilio and can use for outbound communication
      url: callUrl // A URL that produces an XML document (TwiML) which contains instructions for the call
    }, function(err, responseData) {
      //executed when the call has been initiated.
      console.log(responseData.from); // outputs "+14506667788"
    });
  },

  handlePlacementCall: function (placementId, data) {
    // Get placement info
    var placement = Placements.findOne({_id: placementId});
    var job = Jobs.findOne({_id: placement.job});
    var address = Addresses.findOne({_id: job.address});

    // Craft the url
    var callUrl = "https://hrckiosk.ngrok.io/" + "twilio/gatherPlacementResponse?id=" + placementId;

    var res = new Twilio.TwimlResponse();
    res.say('This is an automated call from Aida regarding a job you might be interested.', {voice: 'woman'});
    res.pause({length: 1});
    res.say('There is a position open at ' + job.clientDisplayName + ' for ' + job.jobTitleDisplayName + '.', {voice: 'woman'});
    res.pause({length: 1});
    res.say('This job will be performed at: ', {voice: 'woman'});
    res.say(address.address + ", " + address.city + ", " + address.state + ", " + address.country + ".", {voice: 'woman'});
    res.pause({length: 1});
    res.gather({
      action: callUrl,
      numDigits: 1,
      timeout: 5
    }, function () {
      this.say('If you are interested in the job, please press 1, otherwise you can disregard this call.', {voice: 'woman'});
    });
    res.hangup();

    return res
  },
  gatherPlacementResponse: function (placementId) {
    var res = new Twilio.TwimlResponse();
    res.say('Thank you! A representative will soon get in contact with you.', {voice: 'woman'});
    res.pause({length: 1});
    res.hangup();

    return res;
  }
};
