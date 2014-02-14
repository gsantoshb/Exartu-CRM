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
    return Tasks.find({
        assign: this.userId
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
    doc.createdAt = Date.now();
    doc.creator = Meteor.userId();
});