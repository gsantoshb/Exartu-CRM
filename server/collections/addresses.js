Meteor.publish("linkedAddresses", function (linkid) {
    return Addresses.find({linkId: linkid});
});

Meteor.publish("singleAddress", function (id) {
    return Addresses.find({ _id: id });
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
    doc.hierId=user.currentHierId;
});
Addresses._ensureIndex({dateCreated: 1});
Addresses._ensureIndex({activeStatus: 1});
Addresses._ensureIndex({userId: 1});
Addresses._ensureIndex({hierId: 1});
Addresses._ensureIndex({linkId: 1});
Addresses._ensureIndex({addressTypeId: 1});