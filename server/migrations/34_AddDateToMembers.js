Migrations.add({
  version: 34,
  up: function () {
    var count = 0;
    HotLists.find({$and: [{members: {$exists: true}},{members: {$ne: []}}]}).forEach(function (hotList) {
      var needsMigration = false;
      _.each(hotList.members, function (member, index) {
        if (_.isString(member)){
          needsMigration = true;
          hotList.members.splice(index,1,{id: member, addedAt: null})
        }
      });
      if (needsMigration){_.
        HotLists.update(hotList._id, {$set: {members: hotList.members}})
      }
    });
    console.log('Finished migration 34');
  }
});
