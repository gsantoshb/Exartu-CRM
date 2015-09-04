Meteor.paginatedPublish(Calls, function () {
  if (this.userId){
    return Utils.filterCollectionByUserHier2(this.userId, Calls.find({},{sort: { dateCreated: -1 } }));
  }else{
    this.ready();
  }
}, {
  pageSize: 50,
  publicationName: 'callList'
});