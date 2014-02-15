/*
 * A way to comunicate with other system's users. It's private.
 *
 * Message:
 *  - createdAt: date created
 *  - begin: date begining
 *  - end: date
 *  - done: date complited
 *  - assign: array of user's ids that are assigned to this task
 *  - state: array that holds the historical states
 */

Meteor.publish('tasks', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Tasks.find({
        hierId: user.hierId
    });
})

Meteor.startup(function () {
    Meteor.methods({
        crateTask: function (task) {
            Tasks.insert(task);
        },
    });
});

Tasks.before.insert(function (userId, doc) {
    var user = Meteor.user();
    doc.hierId = user.hierId;
    doc.userId = user._id;
    doc.createdAt = Date.now();
});