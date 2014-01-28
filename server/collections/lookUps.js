Meteor.publish('lookUps', function () {
    return LookUps.find();
})
