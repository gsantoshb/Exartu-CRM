Meteor.publish('contactables', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Contactables.find({
        hierId: user.hierId
    });
})


Contactables.allow({
    insert: function () {
        return true;
    },
    update: function () {
        return true;
    },
});