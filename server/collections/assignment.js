Meteor.publish('assignment', function () {

    if (!this.userId)
        return false;

    return Assignment.find();
});
Assignment.allow({
  insert: function () {
    return true;
  }
});

//<editor-fold desc="************ update job and contactable ****************">
Assignment.before.insert(function(userId, doc, fieldNames, modifier, options){
  var user = Meteor.user();
  doc.hierId = user.hierId;
  doc.userId = user._id;
  doc.createdAt = Date.now();
});
//after update the employee and job
Assignment.after.insert(function(userId, doc, fieldNames, modifier, options){
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            assignment: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            assignment: doc._id
        }
    });
});
//</editor-fold>