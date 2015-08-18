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
          _.extend(data, this.request.bodyFields);
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

var findLastHotslist = function (contactableId) {
  var hotlistsIds = HotLists.find({'members.id': contactableId}, { fields: { _id: 1 } }).map(function (h) {
    return h._id;
  });
  // find all note, sent to this contactable from sorted by date
  var sent = Notes.find({
    $or:[
      { 'links.id': contactableId },
      { 'links.id': {$in: hotlistsIds } }
    ],
    sendAsSMS: true,
    isReply: {$ne: true}
  }, {sort: {dateCreated: -1}}).fetch();
  if (!sent || !sent.length){
    return null;
  }

  var last = sent[0];
  var linkObj = _.findWhere(last.links, {id: contactableId});
  if (!linkObj){
    linkObj = _.find(last.links, function (l) {
      return _.contains(hotlistsIds, l.id);
    });
  }
  // if the last one was sent from a hotList, check that the contactable was a member at the time the message was sent
  // if not, get next last sent note.
  // continue until finding a note that was sent to this contactable or to a hotlist which the contactable was part of at the time
  if (linkObj.type == Enums.linkTypes.hotList.value){
    var hotlist = HotLists.findOne(linkObj.id);
    var memberObj = _.findWhere(hotlist.members, {id: contactableId});
    var i = 0;
    while(last.dateCreated < memberObj.addedAt.getTime()){
      i++;
      last = sent[i];
      linkObj = _.findWhere(last.links, {id: contactableId});
      if (!linkObj){
        linkObj = _.find(last.links, function (l) {
          return _.contains(hotlistsIds, l.id);
        });
      }
      if (linkObj.type != Enums.linkTypes.hotList.value) {
        break;
      }
      hotlist = HotLists.findOne(linkObj.id);
      memberObj = _.findWhere(HotLists.members, {id: contactableId});
    }
  }

  // if last message was sent directly to the contactable, then s not replying to a hotList
  if (linkObj.type != Enums.linkTypes.hotList.value) {
    return null;
  }

  // find out if the contactable already replied to the last message
  var reply = Notes.findOne({
    $and: [
      {'links.id': contactableId},
      {'links.id': hotlist._id}
    ],
    isReply: true,
    dateCreated: { $gt: last.dateCreated }
  });

  if (reply){
    return null;
  }else{
    return hotlist;
  }

};

var processSMSReply = function (reply) {
  // Get origin phone number hierarchy
  var hier = HierarchyManager.getHierByPhoneNumber(reply.To);

  var contactable = ContactableManager.getContactableFromPhoneNumber(reply.From, hier._id);

  if (!contactable)
    throw new Error('There is no contactable with phone number ' + reply.From + ' in hierarchy ' + hier.name);


  // find last hotlist that the contactable was added to
  var lastHotlist = findLastHotslist(contactable._id);
  var note = {};
  if (lastHotlist) {
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
          id: lastHotlist._id,
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