Meteor.publish('jobRateTypes', function () {
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return false;

  return JobRateTypes.find({
    $or: filterByHiers(user.hierId)
  });
})