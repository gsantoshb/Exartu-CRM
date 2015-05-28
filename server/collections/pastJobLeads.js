
Meteor.paginatedPublish(PastJobLeads,
  function () {
    var user = Meteor.users.findOne({_id: this.userId});
    if (!user) return [];

    return Utils.filterCollectionByUserHier.call(this, PastJobLeads.find());
  }, {
    pageSize: 10,
    publicationName: 'pastJobLeads'
  }
);

Meteor.publish('singlePastJobLead', function (id) {
  return PastJobLeads.find({_id: id});
});
Meteor.publish('auxPastJobLeads', function (id) {
  return PastJobLeads.find({members: id});
});

Meteor.paginatedPublish(Contactables,
  function (pastJobLeadId) {
    if (!pastJobLeadId) return [];

    var pastjoblead = PastJobLeads.findOne({_id: pastJobLeadId});
    if (!pastjoblead.members) return [];

    return Contactables.find({_id: {$in: pastjoblead.members}}, {sort: {displayName: 1}});
  }, {
    pageSize: 10,
    publicationName: 'pastJobLeadMembers'
  }
);


Meteor.publish('allPastJobLeads', function () {
  var sub = this;

  var cursor = Utils.filterCollectionByUserHier.call(this, PastJobLeads.find({}));
  Mongo.Collection._publishCursor(cursor, sub, 'allPastJobLeads');

  sub.ready();
});

PastJobLeads.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

PastJobLeads.before.insert(function (userId, doc) {
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
