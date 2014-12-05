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
      throw new Meteor.Error(500, 'Hierarchy has not phone number set up');

    // Send SMS
    _sendSMS(from, to, text, function (err) {
      if (!err) {
        // Update phoneNumber sms count
        Hierarchies.update({ _id: phoneNumberHier._id}, { $inc: { 'phoneNumber.smsCount': 1}});
      }
    });
  },
  processSMSReply: function (reply) {
    // Get origin phone number hierarchy
    var hier = Hierarchies.findOne({'phoneNumber.value': reply.To});
    if (! hier)
      throw new Meteor.Error(404, 'There is no hierarchy with phone number ' + reply.To);

    var hierFilter = Utils.filterByHiers(hier._id);

    // Get contactable with phone number equal to reply.To that belong to hier
    var contactable = Contactables.findOne({'contactMethods.value': reply.From, $or: hierFilter});
    if (! contactable)
      throw new Meteor.Error(404, 'There is no contactable with phone number ' + reply.From + ' in hierarchy ' + hier.name);

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
Router.map(function () {
  this.route('smsReply', {
    path: 'sms/reply',
    where: 'server',
    action: function () {
      // Respond to twilio
      var resp = new Twilio.TwimlResponse();
      this.response.writeHead(200, { 'Content-Type':'text/xml' });
      this.response.end(resp.toString());
      // Process the received sms
      SMSManager.processSMSReply(this.request.body);
    }
  })
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
  } else {
    // Search for available phone numbers
    var result = Meteor.wrapAsync(twilio.availablePhoneNumbers('US').local.get)({ areaCode:'651'});

    if (result.availablePhoneNumbers.length > 0) {
      var newNumber = Meteor.wrapAsync(twilio.incomingPhoneNumbers.create)({
        phoneNumber: result.availablePhoneNumbers[0].phoneNumber,
        areaCode: '651',
        smsMethod: "POST",
        smsUrl: Meteor.absoluteUrl('sms/reply')
      });

    } else {
      throw new Meteor.Error(500, 'There is no available number on Twilio');
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