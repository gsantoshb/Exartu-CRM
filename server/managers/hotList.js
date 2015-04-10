var patternFind = /data-mergefield="(\w+)"/g;
var getPatternReplace = function (id) {
  return new RegExp("<[^><]*data-mergefield=\"" + id + "\"[^><]*>");
};

HotListManager = {
  addHotList: function (hotlist) {
    return HotLists.insert(hotlist);
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