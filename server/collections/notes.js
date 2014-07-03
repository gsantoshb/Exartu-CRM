/*
 * A way to communicate with other system's users. It's private.
 *
 * Message:
 *  - dateCreated: date created
 *  - begin: date beginning
 *  - end: date
 *  - completed: date completed
 *  - assign: array of user's ids that are assigned to this note
 *  - state (calculated in client's transform)
 */

Meteor.publish('notes', function () {
  //    var user = Meteor.users.findOne({
  //        _id: this.userId
  //    });

  if (!this.userId)
    return false;
  return Notes.find({
        $or: filterByHiers(user.hierId)
    });


})

Meteor.startup(function () {
  Meteor.methods({
    createNote: function (note) {
      Notes.insert(note);
    }
  });
});

Notes.before.insert(function (userId, doc) {
//  if (this.connection) {
    var user = Meteor.user();
    doc.hierId = user.hierId;
    doc.userId = user._id;
//  }
    doc.dateCreated = Date.now();
});
Notes.allow({
  update: function (userId, doc, fields, modifier) {
    // todo: check hiers
    return true;
  },
  insert: function (userId, doc, fields, modifier) {
    // todo: check hiers
    return true;
  }
})

// indexes
Notes._ensureIndex({hierId: 1});
Notes._ensureIndex({assign: 1});
Notes._ensureIndex({userId: 1});
Notes._ensureIndex({"links._id":1});