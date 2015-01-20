SMSManager = {
  createHierarchyNumber: function (hierId) {
    // Get hierarchy
    if (! Meteor.user().hierarchies.indexOf(hierId) == -1)
      throw new Meteor.Error(500, 'Invalid hierarchy');

    var hier = Hierarchies.findOne(hierId);
    if (!hier)
      throw new Meteor.Error(404, 'Hierarchy not found');

    if (hier.phoneNumber)
      return hier.phoneNumber;

    // Request number
    var phoneNumber = _requestNumber();
    if (! phoneNumber)
      throw new Meteor.Error(500, 'Error creating hierarchy phone number');

    // Set available SMS
    phoneNumber.smsCount = 0;

    // Set user who requested a hier phone number
    phoneNumber.requestedBy = Meteor.userId();

    // Set number to hierarchy
    Hierarchies.update({_id: hierId}, {$set: { phoneNumber: phoneNumber}});

    return phoneNumber;
  },
  sendSMSToContactable: function (contactableId, from, to, text) {
    // Validate user phone number
    // Simpleschema messes up and does an unasked for conversion of the twilio # (from) which
    // wipes out the '+' sign from the front of the number...add it back here
    from='+'+from;
    var userHierarchies = Utils.getUserHiers();
    var phoneNumberHier;
    _.forEach(userHierarchies, function (userHier) {
      if (userHier.phoneNumber && userHier.phoneNumber.value == from) {
        phoneNumberHier = userHier;
      }
    });

    if (! phoneNumberHier)
      throw new Meteor.Error(500, 'Invalid user phone number');

    // Check if hier's phone number has available sms
    if (phoneNumberHier.phoneNumber.smsCount >= Global._MAX_AVAILABLE_SMS_COUNT)
      throw new Meteor.Error('Hierarchy phone number has reach max SMS count sent');

    // Get contactable hierarchy
    var contactable = Contactables.findOne({_id: contactableId, hierId: { $in: Meteor.user().hierarchies}});
    if (! contactable)
      throw new Meteor.Error(404, 'Contactable not found');

    // Validate contactable phone number
    var contactMethod = _.findWhere(contactable.contactMethods, {value: to});
    if (! contactMethod)
      throw new Meteor.Error(500, 'Invalid phone number');


    var hier = Hierarchies.findOne(contactable.hierId);
    if (! hier)
      throw new Meteor.Error(500, 'Hierarchy not found');

    // Get hierarchy's number
    if (! hier.phoneNumber)
      throw new Meteor.Error(500, 'Hierarchy has no phone number set up');

    // Send SMS
    _sendSMS(from, to, text, function (err) {
      if (!err) {
        // Update phoneNumber sms count
        Hierarchies.update({ _id: phoneNumberHier._id}, { $inc: { 'phoneNumber.smsCount': 1}});
      }
      else
      {
        console.log('sms send error',err);
      }
    });
  },
  processSMSReply: function (reply) {
    // Get origin phone number hierarchy
    var hier = Hierarchies.findOne({'phoneNumber.value': {$regex: reply.To, $options: 'x'}});
    if (! hier)
      throw new Error('There is no hierarchy with phone number ' + reply.To);

    // Get contactable with phone number equal to reply.To that belong to hier
    var hierFilter = Utils.filterByHiers(hier._id);
    var fromNumber = reply.From.trim();
    if (fromNumber.length > 10)
      fromNumber = fromNumber.substring(1, fromNumber.length -1);

    var contactable = Contactables.findOne({ 'contactMethods.value': {$regex: fromNumber, $options: 'x'}, $or: hierFilter});
    if (! contactable)
      throw new Error('There is no contactable with phone number ' + reply.From + ' in hierarchy ' + hier.name);

    // Create note
    var note = {
      msg: reply.Body,
      sendAsSMS: true,
      contactableNumber: reply.From,
      userNumber: reply.To,
      links: [{
        id: contactable._id,
        type: Enums.linkTypes.contactable.value
      }],
      hierId: hier._id,
      isReply: true
    };

    Notes.insert(note);
  }
};

// Twilio SMS Endpoint
Router.map(function() {
  // Placement Statuses
  this.route('smsReply', {
    where: 'server',
    path: 'sms/reply',
    action: function() {
      var response = new RESTAPI.response(this.response);

      // Obtain data from the respective method executed
      var data;
      switch(this.request.method) {
        case 'GET':
          data = this.params.query;
          break;

        case 'POST':
          data = this.request.bodyFields;
          break;

        default:
          response.error('Method not supported');
      }

      try {
        // Process the received sms
        SMSManager.processSMSReply(data);

        // Respond to twilio
        console.log('responding');
        var resp = new Twilio.TwimlResponse();
        response.end(resp.toString(), { type: 'xml', plain: true });
      } catch(err) {
        console.log(err);
        response.error(err.message);
      }
    }
  });
});

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
    var result = Meteor.wrapAsync(twilio.availablePhoneNumbers('US').local.get)({ areaCode:'651'});

    //if (result.availablePhoneNumbers.length > 0) {
    //  newNumber = Meteor.wrapAsync(twilio.incomingPhoneNumbers.create)({
    //    phoneNumber: result.availablePhoneNumbers[0].phoneNumber,
    //    areaCode: '651',
    //    smsMethod: "GET",
    //    smsUrl: Meteor.absoluteUrl('sms/reply')
    //  });
    //
    //} else {
    //  throw new Meteor.Error(500, 'There is no available number on Twilio');
    //}
    //since the above code is failing)...create the twilio number manually using one already purchased
    newNumber={
      phoneNumber: "+16122356835",
      friendlyName: "1-612-235-6835"
    }

  }

  return {
    value: newNumber.phoneNumber,
    displayName: newNumber.friendlyName
  };
};

var _sendSMS = function (from, to, text, cb) {
  if (! twilio) {
    console.warn('TWILIO: Fake SMS send { from: ' + from + ', to: ' + to + ', text: ' + text + '}');
    return;
  }

  twilio.sendSms({
    to: to,
    from: from,
    body: text
  }, Meteor.bindEnvironment(function(err) {
    cb && cb.call({}, err);
  }));
};