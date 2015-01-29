Meteor.publish("contactableAddresses", function (contactableId) {
    return Addresses.find({contactableId: contactableId});
});