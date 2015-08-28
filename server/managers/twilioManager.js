var getNextToCall = function (arrayFlow) {
  console.log('nextCall');
  for (var i = 0; (i < arrayFlow.length); i++) {

    if (arrayFlow[i].called === false) {
      return arrayFlow[i];
    }
  }


}

TwilioManager = {
  createHierarchyNumber: function (hierId) {
    // Get hierarchy
    if (!Meteor.user().hierarchies.indexOf(hierId) == -1)
      throw new Meteor.Error(500, 'Invalid hierarchy');

    var hier = Hierarchies.findOne(hierId);
    if (!hier)
      throw new Meteor.Error(404, 'Hierarchy not found');

    if (hier.phoneNumber)
      return hier.phoneNumber;

    // Request number
    var phoneNumber = _requestNumber();
    if (!phoneNumber)
      throw new Meteor.Error(500, 'Error creating hierarchy phone number');

    // Set available SMS
    phoneNumber.smsCount = 0;

    // Set user who requested a hier phone number
    phoneNumber.requestedBy = Meteor.userId();

    // Set number to hierarchy
    Hierarchies.update({_id: hierId}, {$set: {phoneNumber: phoneNumber}});

    return phoneNumber;
  },
  sendSMSToContactable: function (id, from, to, text, hotListFirstName) {
    var ids;
    // try for a hotlist of contactables
    var hotlist = HotLists.findOne({_id: id});
    if (hotlist) {
      ids = _.pluck(hotlist.members, 'id');
    }
    else ids = [id];
    // Validate user phone number
    // Simpleschema messes up and does an unasked for conversion of the twilio # (from) which
    // wipes out the '+' sign from the front of the number...add it back here
    if (from[0] != '+') {
      from = '+' + from;
    }
    _.each(ids, function (contactableid) {

      var userHierarchies = Utils.getUserHiers();
      var phoneNumberHier;

      _.forEach(userHierarchies, function (userHier) {
        if (userHier.phoneNumber && userHier.phoneNumber.value == from) {
          phoneNumberHier = userHier;
        }
      });


      if (!phoneNumberHier) {
        console.log('invalid user phone number on sms send');
        throw new Meteor.Error(500, 'Invalid user phone number');
      }

      // Check if hier's phone number has available sms
      if (phoneNumberHier.phoneNumber.smsCount >= Global._MAX_AVAILABLE_SMS_COUNT)
        throw new Meteor.Error('Hierarchy phone number has reach max SMS count sent');

      // Get contactable hierarchy
      var contactable = Contactables.findOne({_id: contactableid, hierId: {$in: Meteor.user().hierarchies}});
      if (!contactable)
        throw new Meteor.Error(404, 'Contactable not found', contactableid);
      var destNumber;
      var msgText = text;
      if (hotlist) {
        if (hotListFirstName) {
          if (contactable.person && contactable.person.firstName)
            if (contactable) msgText = contactable.person.firstName + ', ' + msgText;
        }
        var contactMethodsTypes = LookUps.find({
          lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
          lookUpActions: {
            $in: [Enums.lookUpAction.ContactMethod_MobilePhone,
              Enums.lookUpAction.ContactMethod_Phone,
              Enums.lookUpAction.ContactMethod_HomePhone,
              Enums.lookUpAction.ContactMethod_WorkPhone
            ]
          }
        }).fetch();
        _.every(contactable.contactMethods, function (cm) {
          var type = _.findWhere(contactMethodsTypes, {_id: cm.type});
          if (!type)
            return true; //keep looking
          else {
            destNumber = cm.value;
          }
        });
      }
      else {
        // Validate contactable phone number
        var contactMethod = _.findWhere(contactable.contactMethods, {value: to});
        if (!contactMethod)
          throw new Meteor.Error(500, 'Invalid phone number');
        destNumber = to;
      }
      ;
      if (!destNumber) {
        return;
      }

      // Send SMS
      try {
        _sendSMS(from, destNumber, msgText);
        // Update phoneNumber sms count
        Hierarchies.update({_id: phoneNumberHier._id}, {$inc: {'phoneNumber.smsCount': 1}});
      } catch (err) {
        console.error(err);
        console.error(err.stack);
      }

    });
  },
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
    var phone = _.find(employee.contactMethods, function (cm) {
      return phoneCMs.indexOf(cm.type) != -1;
    });
    if (!phone) throw new Error("Employee needs a phone contact method");

    //Get job
    var job = Utils.filterCollectionByUserHier2(Meteor.userId(), Jobs.find({_id: placement.job})).fetch()[0];
    if (!job.address) throw new Error("The job needs a worksite");
    //Get job address
    var address = Addresses.findOne({_id: job.address});
    if (!address) throw new Error("The job needs a worksite");

    // Get hierarchy phone number
    var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    var hier = Hierarchies.findOne({_id: rootHier});
    if (!hier.phoneNumber || !hier.phoneNumber.value) throw new Error("Hierarchy phone number is required");
    // Check twilio credentials
    if (!twilio) throw new Error("Twilio account credentials not set");

    // Craft the url
    var callUrl = Meteor.absoluteUrl("twilio/placementCall?id=" + placement._id);
    // Make the twilio call
    twilio.makeCall({
      to: phone, // Any number Twilio can call
      from: hier.phoneNumber.value, // A number you bought from Twilio and can use for outbound communication
      url: callUrl // A URL that produces an XML document (TwiML) which contains instructions for the call
    }, function (err, responseData) {
      //executed when the call has been initiated.
    });
  },
  handlePlacementCall: function (placementId, data) {
    // Get placement info
    var placement = Placements.findOne({_id: placementId});
    var job = Jobs.findOne({_id: placement.job});
    var address = Addresses.findOne({_id: job.address});

    // Craft the url
    var callUrl = Meteor.absoluteUrl("twilio/gatherPlacementResponse?id=" + placementId);
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
  gatherPlacementResponse: function (placementId, data) {
    var res = new Twilio.TwimlResponse();
    res.say('Thank you! A representative will soon get in contact with you.', {voice: 'woman'});
    res.pause({length: 1});
    res.hangup();

    return res;
  },
  makeWorkFlowCall: function (userId, workFlowId) {
    // Validate parameters
    if (!workFlowId) throw new Error("Placement ID is required");

    // Get placement
    var workFlow = Utils.filterCollectionByUserHier2(userId, WorkFlows.find({_id: workFlowId})).fetch()[0];
    if (!workFlow) throw new Error("Invalid placement ID");

    // Get next call
    var placement = getNextToCall(workFlow.flow);
    //console.log('flow', workFlow.flow);
    //console.log('placement', placement.placementId);
    //console.log('placement', placement);
    //var employee = Utils.filterCollectionByUserHier2(Meteor.userId(), Contactables.find({_id: placement.employee})).fetch()[0];
    //if (!employee.contactMethods || employee.contactMethods.length == 0) throw new Error("Employee needs a phone contact method");

    // Get employee phone number
    //var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
    //var phoneCMs = _.pluck(LookUps.find({
    //  hierId: rootHier,
    //  lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
    //  lookUpActions: Enums.lookUpAction.ContactMethod_Phone
    //}).fetch(), '_id');
    //var phone = _.find(employee.contactMethods, function (cm) {return phoneCMs.indexOf(cm.type) != -1;});
    //console.log('phone', phone);
    //if (!phone) throw new Error("Employee needs a phone contact method");
    if (placement) {
      //Get job
      var job = Utils.filterCollectionByUserHier2(userId, Jobs.find({_id: workFlow.jobId})).fetch()[0];
      if (!job.address) throw new Error("The job needs a worksite");
      //console.log('job', job);
      //Get job address
      var address = Addresses.findOne({_id: job.address});
      if (!address) throw new Error("The job needs a worksite");
      //console.log('address', address);

      // Get hierarchy phone number
      var rootHier = Utils.getHierTreeRoot(workFlow.hierId);
      var hier = Hierarchies.findOne({_id: rootHier});
      if (!hier.phoneNumber || !hier.phoneNumber.value) throw new Error("Hierarchy phone number is required");
      //console.log('hier', hier);
      // Check twilio credentials
      if (!twilio) throw new Error("Twilio account credentials not set");

      // Craft the url
      var callUrl = Meteor.absoluteUrl("twilio/workFlow?id=" + workFlowId + "&placementId=" + placement.placementId+"&userId="+userId);
      // Make the twilio call
      twilio.makeCall({
        to: placement.phone, // Any number Twilio can call
        from: hier.phoneNumber.value, // A number you bought from Twilio and can use for outbound communication
        url: callUrl, // A URL that produces an XML document (TwiML) which contains instructions for the call
        statusCallback : Meteor.absoluteUrl("twilio/callback?id="+workFlowId+"&placementId=" + placement.placementId+"&userId="+userId),
        statusCallbackMethod: "POST",
        statusCallbackEvent: ["answered", "completed"],
        method: "GET",
        ifMachine: "Hangup"
      }, function (err, responseData) {
        //executed when the call has been initiated.

      });

    }
  },
  handleWorkFlowCall: function (userId, workFlowId, placementId, data) {
    // Get placement info
    var placement = Placements.findOne({_id: placementId});
    var job = Jobs.findOne({_id: placement.job});
    var address = Addresses.findOne({_id: job.address});

    // Craft the url
    var callUrl = Meteor.absoluteUrl("twilio/gatherWorkFlowResponse?id=" + workFlowId + "&placementId=" + placementId+"&userId="+userId);
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
  gatherWorkFlowResponseTrue: function (workFlowId, placementId, data) {
    var res = new Twilio.TwimlResponse();
    //console.log('twilio response', data);
    res.say('Thank you! A representative will soon get in contact with you.', {voice: 'woman'});
    res.pause({length: 1});
    res.hangup();
    return res;
  },
  gatherWorkFlowResponseFalse: function (workFlowId, placementId, data) {
    var res = new Twilio.TwimlResponse();
    //console.log('twilio response', data);
    res.say('Thank you! Good bye.', {voice: 'woman'});
    res.pause({length: 1});
    res.hangup();
    return res;
  },
  makeWorkFlowCallPlacementConfirm: function(userId,workFlowId){
      // Validate parameters
      if (!workFlowId) throw new Error("Placement ID is required");

      // Get placement
      var workFlow = Utils.filterCollectionByUserHier2(userId, WorkFlows.find({_id: workFlowId})).fetch()[0];
      if (!workFlow) throw new Error("Invalid placement ID");

      // Get next call
      var placement = getNextToCall(workFlow.flow);

      if (placement) {
        //Get job
        var job = Utils.filterCollectionByUserHier2(userId, Jobs.find({_id: workFlow.jobId})).fetch()[0];
        if (!job.address) throw new Error("The job needs a worksite");
        //Get job address
        var address = Addresses.findOne({_id: job.address});
        if (!address) throw new Error("The job needs a worksite");
        //console.log('address', address);

        // Get hierarchy phone number
        var rootHier = Utils.getHierTreeRoot(workFlow.hierId);
        var hier = Hierarchies.findOne({_id: rootHier});
        if (!hier.phoneNumber || !hier.phoneNumber.value) throw new Error("Hierarchy phone number is required");
        // Check twilio credentials
        if (!twilio) throw new Error("Twilio account credentials not set");

        // Craft the url
        var callUrl = Meteor.absoluteUrl("twilio/workFlowPlacementConfirm?id=" + workFlowId + "&placementId=" + placement.placementId+"&userId="+userId);
        // Make the twilio call
        twilio.makeCall({
          to: placement.phone, // Any number Twilio can call
          from: hier.phoneNumber.value, // A number you bought from Twilio and can use for outbound communication
          url: callUrl, // A URL that produces an XML document (TwiML) which contains instructions for the call
          statusCallback : Meteor.absoluteUrl("twilio/callbackPlacementConfirm?id="+workFlowId+"&placementId=" + placement.placementId+"&userId="+userId),
          statusCallbackMethod: "POST",
          statusCallbackEvent: ["answered", "completed"],
          method: "GET",
          ifMachine: "Hangup"
        }, function (err, responseData) {
          //executed when the call has been initiated.

        });

      }
  },
  handleWorkFlowPlacementConfirmCall: function (userId, workFlowId, placementId, data) {
    // Get placement info
    var placement = Placements.findOne({_id: placementId});
    var job = Jobs.findOne({_id: placement.job});
    var address = Addresses.findOne({_id: job.address});

    // Craft the url
    var callUrl = Meteor.absoluteUrl("twilio/gatherWorkFlowPlacementConfirm?id=" + workFlowId + "&placementId=" + placementId+"&userId="+userId);
    var res = new Twilio.TwimlResponse();
    res.say('This is an automated call from Aida to confirm you are going to work at', {voice: 'woman'});
    res.pause({length: 1});
    res.say('' + job.clientDisplayName + ' for ' + job.jobTitleDisplayName + '.', {voice: 'woman'});
    res.pause({length: 1});
    res.say('This job will be performed at: ', {voice: 'woman'});
    res.say(address.address + ", " + address.city + ", " + address.state + ", " + address.country + ".", {voice: 'woman'});
    res.pause({length: 1});
    res.gather({
      action: callUrl,
      numDigits: 1,
      timeout: 5
    }, function () {
      this.say('To confirm your assistance, please press 1, to cancel press 2, otherwise you can disregard this call.', {voice: 'woman'});
    });
    res.hangup();
    return res
  }
};

var _requestNumber = function () {
  var newNumber;

  if (!twilio) {
    var fakeNumber = '+' + Math.round(Math.random() * Math.pow(10, 11));
    newNumber = {
      phoneNumber: fakeNumber,
      friendlyName: fakeNumber //'(' + fakeNumber.slice(1, 4) + ') ' + fakeNumber.slice(5, 8) + '-' + fakeNumber.slice(8, 12)
    };

    console.warn('TWILIO: Fake number', newNumber);
  }
  else {
    // Search for available phone numbers
    var result = Meteor.wrapAsync(twilio.availablePhoneNumbers('US').local.get)({areaCode: '651'});

    if (result.availablePhoneNumbers.length > 0) {
      console.log('incomingPhone', twilio.incomingPhoneNumbers);
      newNumber = Meteor.wrapAsync(twilio.incomingPhoneNumbers.create)({
        phoneNumber: result.availablePhoneNumbers[0].phoneNumber,
        areaCode: '651',
        smsMethod: "GET",
        smsUrl: Meteor.absoluteUrl('sms/reply'),
        voiceUrl: Meteor.absoluteUrl('voice/handle')

      });

    } else {
      throw new Meteor.Error(500, 'There is no available number on Twilio');
    }
    //since the above code is failing)...create the twilio number manually using one already purchased
    //newNumber = {
    //    phoneNumber: "+16122356835",
    //    friendlyName: "1-612-235-6835"
    //}

  }

  return {
    value: newNumber.phoneNumber,
    displayName: newNumber.friendlyName
  };
};

var _sendSMS = function (from, to, text) {
  if (!twilio) {
    console.warn('TWILIO: Fake SMS send { from: ' + from + ', to: ' + to + ', text: ' + text + '}');
    return;
  } else {
    console.log('SMS send { from: ' + from + ', to: ' + to + ', text: ' + text + '}');
  }

  return Meteor.wrapAsync(twilio.sendMessage)({
    to: to,
    from: from,
    body: text
  });
};


