// Twilio Voice Endpoint
Router.map(function () {
  // receive call from twilio
  this.route('voiceHook', {
    where: 'server',
    path: 'voice/handle',
    action: function () {
      var response = new RESTAPI.response(this.response);

      // Obtain data from the respective method executed
      var data;
      switch (this.request.method) {
        case 'GET':
          data = this.params.query;
          break;

        case 'POST':
          data = this.request.body;
          break;

        default:
          response.error('Method not supported');
      }

      try {


        var hier = HierarchyManager.getHierByPhoneNumber(data.To);

        //Find if there is an available user to answer the call
        var availableUsers = Meteor.users.find({
          "status.online": true,
          receiveCallAvailable: true,
          hierId: hier._id
        }, {limit: 9}).fetch();

        var contactable = ContactableManager.getContactableFromPhoneNumber(data.From, hier._id);

        // Respond to twilio
        var resp = new Twilio.TwimlResponse();



        // if no one is available send to voice mail
        if (! availableUsers.length){
          resp = resp.say('All our representatives are busy at the moment. Please leave a message', {
            voice: 'woman',
            language: 'en-us'
          });
          resp = resp.record({
            action: 'newVoiceMessage'
          });
        }else{
          if (contactable) {
            resp = resp.say('Thank you for calling ' + contactable.person.firstName + ' ' + contactable.person.lastName + '.Your call is being transfered', {
              voice: 'woman',
              language: 'en-us'
            });
          }
          else {
            //Greet the user
            resp = resp.say('Thank you for calling. Your call is being transferred.', {
              voice: 'woman',
              language: 'en-us'
            });
          }
          //Redirect to an active agent
          _.forEach(availableUsers, function (user) {
            resp = resp.dial({
              action: '/dialFinished'
            }, function (node) {
              node.client(user._id);
            });

          });
        }

        Calls.insert({
          twCallId: this.request.body.CallSid,
          incoming: true,
          hierId: hier._id,
          availableUsers: _.pluck(availableUsers, '_id')
        });

        response.end(resp.toString(), {type: 'xml', plain: true});
      } catch (err) {
        console.log(err);
        response.error(err.message);
      }
    }
  });

  // dial action
  this.route('dialFinished', {
    where: 'server',
    path: 'dialFinished',
    action: function () {
      var response = new RESTAPI.response(this.response);

      // if no one picked up send to voice mail
      if (_.include(['no-answer', 'busy'], this.request.body.DialCallStatus)) {
        Calls.update({
          twCallId: this.request.body.CallSid
        },{
          $set: {
            voiceMail: true
          }
        });


        var resp = new Twilio.TwimlResponse();
        resp = resp.say('All our representatives are busy at the moment. Please leave a message', {
          voice: 'woman',
          language: 'en-us'
        });
        resp = resp.record({
          action: 'newVoiceMessage'
        });
        response.end(resp.toString(), {type: 'xml', plain: true});
      }else{
        Calls.update({
          twCallId: this.request.body.CallSid
        },{
          $set: {
            status:  this.request.body.DialCallStatus
          }
        });
      }
    }
  });

  //record action
  this.route('newVoiceMessage', {
    where: 'server',
    path: 'newVoiceMessage',
    action: function () {
      Calls.update({
        twCallId: this.request.body.CallSid
      },{
        $set: {
          voiceMailUrl:  this.request.body.RecordingUrl
        }
      });
    }
  });
});