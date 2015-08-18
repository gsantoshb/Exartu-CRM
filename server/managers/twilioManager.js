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
    sendSMSToContactable: function (id, from, to, text,hotListFirstName) {
        var ids;
        // try for a hotlist of contactables
        var hotlist = HotLists.findOne({_id:id});
        if (hotlist) {
            ids = _.pluck(hotlist.members, 'id');
        }
        else ids = [id];
        // Validate user phone number
        // Simpleschema messes up and does an unasked for conversion of the twilio # (from) which
        // wipes out the '+' sign from the front of the number...add it back here
        if (from[0] != '+'){
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
                throw new Meteor.Error(404, 'Contactable not found',contactableid);
            var destNumber;
            var msgText=text;
            if (hotlist)
            {
                if (hotListFirstName)
                {
                    if (contactable.person && contactable.person.firstName)
                        if (contactable) msgText= contactable.person.firstName + ', ' + msgText;
                }
                var contactMethodsTypes=LookUps.find({
                    lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
                    lookUpActions: "ContactMethod_MobilePhone"
                        }).fetch();
                _.every(contactable.contactMethods, function (cm) {
                    var type = _.findWhere(contactMethodsTypes, {_id: cm.type});
                    if (!type)
                        return true; //keep looking
                    else {
                        destNumber=cm.value;
                    }
                });
            }
            else {
                // Validate contactable phone number
                var contactMethod = _.findWhere(contactable.contactMethods, {value: to});
                if (!contactMethod)
                    throw new Meteor.Error(500, 'Invalid phone number');
                destNumber=to;
            };
            if (!destNumber){
                return;
            }

            // Send SMS
            _sendSMS(from, destNumber, msgText, function (err) {
                if (!err) {
                    // Update phoneNumber sms count
                    Hierarchies.update({_id: phoneNumberHier._id}, {$inc: {'phoneNumber.smsCount': 1}});
                }
                else {
                    console.log('sms send error', err);
                }
            });

        });
    },

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
          newNumber = Meteor.wrapAsync(twilio.incomingPhoneNumbers.create)({
            phoneNumber: result.availablePhoneNumbers[0].phoneNumber,
            areaCode: '651',
            smsMethod: "GET",
              smsUrl: Meteor.absoluteUrl('sms/reply'),
              voiceUrl:  Meteor.absoluteUrl('voice/handle')

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

var _sendSMS = function (from, to, text, cb) {
    if (!twilio) {
        console.warn('TWILIO: Fake SMS send { from: ' + from + ', to: ' + to + ', text: ' + text + '}');
        return;
    }

    twilio.sendSms({
        to: to,
        from: from,
        body: text
    }, Meteor.bindEnvironment(function (err) {
        cb && cb.call({}, err);
    }));
};


