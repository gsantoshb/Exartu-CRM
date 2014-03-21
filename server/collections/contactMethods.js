/**
 * Created by javier on 20/03/14.
 */
/*
 * ContactMethods:
 *  - type (enum)
 *  - hierId
 *  - displayName
 */

Meteor.publish('contactMethods', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

//    if (!user)
//        return false;

    return ContactMethods.find({
//        hierId: user.hierId
    });
})
