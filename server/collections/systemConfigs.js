Meteor.publish('systemConfigs', function () {
  return SystemConfigs.find();
});