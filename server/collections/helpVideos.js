Meteor.publish('helpVideos', function () {
  var user = Meteor.users.findOne({
    _id: this.userId
  });
  if (!user){
    return [];
  }
  return HelpVideos.find();
});