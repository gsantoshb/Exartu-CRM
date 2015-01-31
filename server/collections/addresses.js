Meteor.publish("linkedAddresses", function (linkid) {
    return Addresses.find({linkId: linkid});
});
Addresses.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, doc, fieldNames, modifier) {
        return true;
    },
    remove: function (userId) {
        var user = Meteor.users.findOne({_id: userId});
        if (!user) return false;
        return RoleManager.bUserIsAdmin(user);
    }
});

Addresses.before.insert(function (userId, doc) {
    var user=Meteor.users.find({_id:userId});
    doc.dateCreated=Date.now();
    doc.userId=userId;
    doc.hierId=user.hierId;
});
