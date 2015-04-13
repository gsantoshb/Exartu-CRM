
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
  }
};