/**
 * Created by ramiro on 09/06/15.
 */
lastEntriesManager = {
  addEntry: function(entry) {
    var user = Meteor.user();
    console.log(entry);
    console.log(user)
    if(user){
        var e = LastEntries.findOne({entity: entry.entity, userId: user._id, hierId: user.currentHierId});
        console.log(e);
        if (!e) {
          console.log('no e')
          switch(entry.type){
            case Enums.linkTypes.contactable.value:{
              var c = Contactables.findOne({_id:entry.entity},{fields:{displayName:1}});
              _.extend(entry, c);
              break;
            }
            case Enums.linkTypes.job.value:{
              var j = Jobs.findOne({_id:entry.entity}, {fields:{displayName:1}});
              _.extend(entry, j);
            }
            case Enums.linkTypes.placement.value:{
              var p = Placements.findOne({_id:entry.entity}, {fields:{displayName:1}});
              _.extend(entry, p);
            }
            case Enums.linkTypes.hotList.value:{
              var h = HotLists.findOne({_id:entry.entity}, {fields:{displayName:1}});
              _.extend(entry, h);
            }

          }
          _.extend(entry, {dateCreated:new Date(), hierId:user.currentHierId, userId:user._id, pinged: false})
          LastEntries.insert(entry);
        }

    }
  },
  removeEntry:function(id){
    LastEntries.remove({_id:id});
  }
};