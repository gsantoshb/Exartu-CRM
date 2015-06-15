/**
 * Created by ramiro on 09/06/15.
 */
Meteor.publish('lastEntries', function (searchStringEntries, sort) {
  //var user = Meteor.user()
  if(this.userId) {
    console.log(this.userId);
    return [Utils.filterCollectionByUserHier.call(this, LastEntries.find({userId:this.userId, displayName:{$regex:".*"+searchStringEntries+".*",$options:'i'}},{sort:{pinged:-1,dateCreated:sort},limit:10}))];
  }
  //return  [Utils.filterCollectionByUserHier.call(this,LastEntries.find({userId:"addd1805-1121-4252-9abc-a9f2ca9d7b3a", pinged:false},{sort:{dateCreated:-1}}))];
});


LastEntries._ensureIndex({hierId: 1});
LastEntries._ensureIndex({userId: 1});
LastEntries._ensureIndex({pinged: 1});
LastEntries._ensureIndex({dateCreated: 1});
