Meteor.publish('roles', function () {
    return Roles.find();
})

Roles.allow({
    insert: function (userId, party) {
        return true;
    },
    update: function (userId, party) {
        return true;
    }
});

