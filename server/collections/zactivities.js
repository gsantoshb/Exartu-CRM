Activities = new Meteor.Collection("activities");

/***
userId
hierId
type
entityId
data
***/


Meteor.publish('activities', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Activities.find({
        hierId: user.hierId
    });
})

//Contactables.allow({
//    insert: function () {
//        return Meteor.userId;
//    }
//});

Contactables.after.insert(function (userId, doc) {
    Activities.insert({
        userId: userId,
        hierId: Meteor.user().hierId,
        type: Enums.activitiesType.contactableAdd,
        entityId: doc._id,
        data: {}
    })
})