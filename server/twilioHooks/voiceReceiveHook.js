// Twilio Voice Endpoint
Router.map(function () {
    // Placement Statuses
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
                var availableUsers =  Meteor.users.find({ "status.online": true , receiveCallAvailable:true, hierId : hier._id},{limit:9}).fetch();

                var contactable = ContactableManager.getContactableFromPhoneNumber(data.From,hier._id);

                // Respond to twilio
                var resp = new Twilio.TwimlResponse();

                if(contactable){
                    resp = resp.say('Thank you for calling ' + contactable.person.firstName + ' ' +  contactable.person.lastName + '.Your call is being transfered',
                        {
                            voice:'woman',
                            language:'en-us'
                        });
                }
                else {
                    //Greet the user
                    resp = resp.say('Thank you for calling. Your call is being transferred.',
                        {
                            voice: 'woman',
                            language: 'en-us'
                        });
                }
                //Redirect to an active agent
                _.forEach(availableUsers, function (user) {
                    resp = resp.dial({}, function(node) {
                        node.client(user._id);
                    });

                });



                response.end(resp.toString(), {type: 'xml', plain: true});
            } catch (err) {
                console.log(err);
                response.error(err.message);
            }
        }
    });
});
