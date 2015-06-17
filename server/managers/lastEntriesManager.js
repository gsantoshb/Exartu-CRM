/**
 * Created by ramiro on 09/06/15.
 */
lastEntriesManager = {
  addEntry: function(entry) {
    var user = Meteor.user();
    if(user){
        var e = LastEntries.findOne({entity: entry.entity, userId: user._id, hierId: user.currentHierId});
        if (!e) {
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
  },
  changePing: function(id){
    var l = LastEntries.findOne({_id:id});
    if(!l.pinged){
      var numberPinged = Utils.filterCollectionByUserHier2(Meteor.userId(),LastEntries.find({userId:Meteor.user()._id, pinged:true})).count();
      LastEntries.update({_id:id},{$set:{pinged: true, index:numberPinged+1}});
    }
    else{
      var selector= {
        $and:[
          {$or: Utils.filterByHiers(Meteor.user().currentHierId)},
          {userId: Meteor.userId},
          {pinged: true},
          {index: {$gte: l.index}}]
      }
      LastEntries.update(selector,{$inc:{index:-1}},{multi:true})
      LastEntries.update({_id:id},{$set:{pinged:false}});
    }
  },
  updateIndex:function(element, before){
    if(!before){
      //firstPosition
      var elementObject = LastEntries.findOne({_id:element});
      var elementIndex = elementObject.index;
      var selector= {
        $and:[
          {$or: Utils.filterByHiers(Meteor.user().currentHierId)},
          {userId: Meteor.userId},
          {pinged: true},
          {$and:[{index:{$gte: 1}},{index:{$lt:elementIndex}}]}
        ]
      }
      LastEntries.update(selector,{$inc:{index:1}},{multi:true});
      LastEntries.update(element, {$set:{index:1}});
    }
    else{
      var elementObject = LastEntries.findOne({_id:element});
      var elementIndex = elementObject.index;
      var beforeObject = LastEntries.findOne({_id:before});
      var beforeIndex = beforeObject.index;
      if(elementIndex>beforeIndex){
        var selector= {
          $and:[
            {$or: Utils.filterByHiers(Meteor.user().currentHierId)},
            {userId: Meteor.userId},
            {pinged: true},
            {$and:[{index:{$gt: beforeIndex}},{index:{$lt:elementIndex}}]},
            {_id:{$ne:element}}
          ]
        }
        LastEntries.update(selector,{$inc:{index:1}},{multi:true});
        LastEntries.update(element, {$set:{index:beforeIndex+1}});
      }
      else{
        var selector= {
          $and:[
            {$or: Utils.filterByHiers(Meteor.user().currentHierId)},
            {userId: Meteor.userId},
            {pinged: true},
            {$and:[{index:{$gt: elementIndex}},{index:{$lte:beforeIndex}}]},
            {_id:{$ne:element}}
          ]
        }
        LastEntries.update(selector,{$inc:{index:-1}},{multi:true});
        LastEntries.update(element, {$set:{index:beforeIndex}});
      }
    }
  }
};