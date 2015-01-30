Meteor.publish("linkedAddresses", function (linkid) {
    return Addresses.find({linkId: linkid});
});