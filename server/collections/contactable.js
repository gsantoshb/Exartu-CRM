Contactables = new Meteor.Collection("contactables");

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
Meteor.startup(function () {
    Meteor.methods({
        addContactable: function (contactable) {
            var user = Meteor.user();
            if (user == null)
                throw new Meteor.Error(401, "Please login");

            addSystemMetadata(contactable, user);

            Contactables.insert(contactable);
        }
    });
});
Contactables.allow({
    update: function () {
        return true;
    }
});