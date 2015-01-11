
HotListView = new View('hotLists', {
  collection: HotLists,
  cursors: function(hotList)
  {
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


Meteor.publish('hotListDetails', function (id) {
  return Utils.filterCollectionByUserHier.call(this, HotListView.find(id));
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

HotLists.after.insert(function(userId, doc){

});

HotLists.after.update(function(userId, doc){


});


// add some employee fields for hotList sorting
HotLists.before.insert(function (userId, doc) {
});
HotLists.after.update(function (userId, doc) {

});
