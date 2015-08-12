// Twilio SMS Endpoint
Router.map(function () {
    // Placement Statuses
    this.route('smsHook', {
        where: 'server',
        path: 'sms/reply',
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
                // Process the received sms
                processSMSReply(data);

                // Respond to twilio
                var resp = new Twilio.TwimlResponse();
                response.end(resp.toString(), {type: 'xml', plain: true});
            } catch (err) {
                console.log(err);
                response.error(err.message);
            }
        }
    });
});

var processSMSReply = function (reply) {
    // Get origin phone number hierarchy
    var hier = HierarchyManager.getHierByPhoneNumber(reply.To);

   var contactable = ContactableManager.getContactableFromPhoneNumber(reply.From,hier._id);

    if (!contactable)
        throw new Error('There is no contactable with phone number ' + reply.From + ' in hierarchy ' + hier.name);

    var hotlist = HotLists.findOne({members: contactable._id}, {$sort:{dateCreated: -1}});
    var note = {}
    if(hotlist){
        note = {
            msg: reply.Body,
            sendAsSMS: true,
            contactableNumber: reply.From,
            userNumber: reply.To,
            links: [{
                id: contactable._id,
                type: Enums.linkTypes.contactable.value
            },
                {
                    id:hotlist._id,
                    type: Enums.linkTypes.hotList.value
                }
            ],
            hierId: hier._id,
            isReply: true
        };
    }
    else {
        // Create note
        note = {
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
    }

    Notes.insert(note);
}