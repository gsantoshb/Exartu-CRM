Meteor.methods({
    'addHotList': function (hotlist) {
        try {
            return HotListManager.addHotList(hotlist);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    },
    'hotListTextMessageSend': function (msg, id) {
        return HotListManager.hotListTextMessageSend(msg,id);
    },
    'getValidResponseMembers': function(hotlist){
       var hotlistMembers = hotlist.members;
       var validMembers = [];
       _.forEach(hotlistMembers, function(m){
         var result = HotLists.findOne({_id:{$ne: hotlist._id},dateCreated:{$gte:  hotlist.dateCreated}, members:{$in: [m]}  })
         if(!result){
           validMembers.push(m);
         }
       })
      return validMembers;


    },
    'updateHotList': function(hotlist){
      try {
        return HotListManager.updateHotList(hotlist);
      } catch (err) {
        throw new Meteor.Error(err.message);
      }
    }
});