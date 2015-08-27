Meteor.paginatedPublish(WorkFlows,
  function () {
    var user = Meteor.users.findOne({_id: this.userId});
    if (!user) return [];
    //console.log(PastJobLeads.find().fetch())
    return Utils.filterCollectionByUserHier.call(this, WorkFlows.find({},{sort:{dateCreated:-1}}));
  }, {
    pageSize: 10,
    publicationName: 'workFlows'
  }
);

Meteor.publish('singleWorkFlow', function (id) {
  console.log('singleWorkFlow', id);
  return Utils.filterCollectionByUserHier.call(this, WorkFlows.find({_id: id}));
});

WorkFlows.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

WorkFlows.before.insert(function (userId, doc) {
  //if template creation from account registration then no userid yet
  if (userId) {
    var user = Meteor.users.findOne({_id: userId});
    doc.hierId = user.currentHierId;
    doc.userId = user._id;
    doc.dateCreated = Date.now();
  }
});
