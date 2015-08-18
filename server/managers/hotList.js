
HotListManager = {
  addHotList: function (hotList) {
    // Validations
    if (!hotList.displayName) throw new Error('Display Name is required');
    if (!hotList.category) throw new Error('Category is required');

    var user = Meteor.user();
    var rootHier = Utils.getHierTreeRoot(user.currentHierId);

    // Set hot list properties
    hotList.activeStatus = LookUps.findOne({hierId: rootHier, lookUpCode: Enums.lookUpTypes.active.status.lookUpCode, isDefault: true})._id;

    return HotLists.insert(hotList);
  },
  'hotListTextMessageSend': function(msg,id) {

        console.log('hot list text message send',msg,id);
        throw new Meteor.Error('not ready to process this yet');
        return ;
    },
  updateHotList: function(hotlist){
    HotLists.update({_id: hotlist._id}, {$set: {members: hotlist.members }});
  },
  addToHotlist: function (hotListId, ids) {
    var progress = ServerProgress.start(Meteor.userId(), 'addingToHotList');

    progress.set(1);

    var count = 0;
    var index = 0;
    var length = ids.length;
    if (!_.isArray(ids)) return;

    var hotList = HotLists.findOne({ _id: hotListId });
    var members = hotList.members || [];
    var now = new Date();

    //HotLists.update({ _id: hotlist._id }, { $addToSet: { members: { $each: ids } } }); //$each not working in meteor
    _.each(ids, function (id) {
      ++index;
      progress.set(100*index/length);
      if (!_.findWhere(members, {id: id})){
        members.push({id: id, addedAt: now});
        ++count;
      }
    });
    HotLists.update({ _id: hotListId }, { $set: { members: members } });
    return count;
  },
  removeFromHotList: function (hotListId, contactableId) {
    HotLists.update({ _id: hotListId }, { $pull: { members: { id: contactableId  } } });
  },
  addNote: function (hotlistId, note) {

    var hotlist = HotLists.findOne(hotlistId);

    if (!hotlist){
      throw new Error('hotlist not found');
    }

    if (note.sendAsSMS) {
      // Send SMS to contactableId (which may be a contactable or a hotlist of contactables)
      TwilioManager.sendSMSToContactable(hotlistId, note.userNumber, note.contactableNumber, note.msg, note.hotListFirstName);
    }

    Notes.insert(note);
  }
};