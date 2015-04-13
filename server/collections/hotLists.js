HotListView = new View('hotLists', {
  collection: HotLists,
  cursors: function(hotList)
  {
      // Client
      this.publish({
          cursor: function (hotlist) {
              var members = (hotlist.members) ? hotlist.members : [];
              return Contactables.find({_id: {$in : members}});
          },
          to: 'contactables',
          observedProperties: ['members'],
          onChange: function (changedProps, oldSelector) {
              var members = (changedProps.members) ? changedProps.members : [];
              var newSelector = { _id: { $in: members } };
              return Contactables.find(newSelector);
          }
      });
  }
});

Meteor.paginatedPublish(HotListView, function()
  {
    var user = Meteor.users.findOne({
      _id: this.userId
    });

    if (!user)
      return [];
    return Utils.filterCollectionByUserHier.call(this, HotListView.find());
  }, {
      pageSize: 10,
      publicationName: 'hotLists'
  }
);

Meteor.publish('singleHotList', function (id) {
  return  HotListView.find({_id: id});
});
Meteor.publish('auxHotLists', function (id) {
    return  HotListView.find({members: id});
});

Meteor.paginatedPublish(Contactables, function(hotListId)
    {
        if (!hotListId) return [];

        var hotlist = HotLists.findOne({_id: hotListId});
        if (!hotlist.members) return [];

        return Contactables.find({_id: { $in : hotlist.members } }, {sort: {displayName: 1}} );
    }, {
        pageSize: 10,
        publicationName: 'hotListMembers'
    }
);

Meteor.publish('hotListDetails', function (id) {
  return Utils.filterCollectionByUserHier.call(this, HotLists.find(id));
});

Meteor.publish('allHotLists', function () {
  var sub = this;
  HotListView.publishCursor(Utils.filterCollectionByUserHier.call(this, HotListView.find({},{
    fields: {
    }
  })), sub, 'allHotLists');
  sub.ready();
});

HotLists.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

HotLists.before.insert(function (userId, doc) {
  try{
    var user = Meteor.user() || {};
  }catch (e){
    //when the insert is trigger from the server
    var user= { }
  }
  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();
  if (!doc.activeStatus || doc.activeStatus==null) doc.activeStatus=LookUpManager.getActiveStatusDefaultId();

});
