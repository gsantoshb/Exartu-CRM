Meteor.methods({
  'addHotList': function(hotlist){
    try {
      return HotListManager.addHotList(hotlist);
    } catch(err) {
      throw new Meteor.Error(err.message);
    }
  }
});