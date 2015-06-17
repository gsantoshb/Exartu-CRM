
Meteor.paginatedPublish(PastJobLeads,
  function () {
    var user = Meteor.users.findOne({_id: this.userId});
      if (!user) return [];
    //console.log(PastJobLeads.find().fetch())
    return Utils.filterCollectionByUserHier.call(this, PastJobLeads.find({},{sort:{dateCreated:-1}}));
  }, {
    pageSize: 10,
    publicationName: 'pastJobLeads'
  }
);

PastJobLeads.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

//PastJobLeads.before.insert(function (userId, doc) {
//  try{
//    var user = Meteor.user() || {};
//  }catch (e){
//    //when the insert is trigger from the server
//    var user= { }
//  }
//  doc.hierId = user.currentHierId || doc.hierId;
//  doc.userId = user._id || doc.userId;
//  doc.dateCreated = Date.now();
//  if (!doc.activeStatus || doc.activeStatus==null) doc.activeStatus=LookUpManager.getActiveStatusDefaultId();
//
//});


PastJobLeads._ensureIndex({dateCreated: 1});
