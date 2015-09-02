Meteor.publish('callList', function () {
  if (this.userId){
    return Utils.filterCollectionByUserHier2(this.userId, Calls.find());
  }else{
    this.ready();
  }
});