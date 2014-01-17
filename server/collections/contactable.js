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

            console.log('hellou');
            var user = Meteor.user();
            if (user == null)
                throw new Meteor.Error(401, "Please login");

            addSystemMetadata(contactable, user);

            if (extendAndValidate(contactable)) {
                console.log('valid!!!!!! :D')
                console.dir(contactable);
                //                Contactables.insert(contactable);
            } else {
                console.log('NOT valid :(')
                console.dir(contactable);
            }
        }
    });
});

Contactables.allow({
    update: function () {
        return true;
    }
});


Contactables.before.insert(function (userId, doc) {
    doc.createdAt = Date.now();
});

var extendAndValidate = function (contactable) {
    //contactable's things
    if (!contactable.contactMethods)
        contactable.contactMethods = [];

    if (!contactable.type || !contactable.type.length) {
        console.log('the contactable must have a type');
        return false;
    }
    var v = true;
    //add the services defined in the types
    _.forEach(contactable.type, function (type) {
        var ObjType = _.findWhere(ObjectType, {
            _id: type
        });
        console.log('adding services');
        _.forEach(ObjType.services, function (service) {
            contactable[service] = [];
        });
        v = v && validateContactable(contactable, type);
    });
    return v;
};