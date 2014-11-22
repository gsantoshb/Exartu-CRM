Meteor.publish('contactMethods', function () {
  return ContactMethods.find();
});