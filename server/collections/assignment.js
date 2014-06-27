Meteor.publish('assignment', function () {

    if (!this.userId)
        return false;

    return Assignment.find();
});
Assignment.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Assignment.before.insert(function(userId, doc, fieldNames, modifier, options){
  var job= Jobs.findOne({ _id: doc.job });
  if (! job)
    return false;

  if (job.assignment)
    return false;

  var user = Meteor.user();
  doc.hierId = user.hierId;
  doc.userId = user._id;
  doc.createdAt = Date.now();
});

//<editor-fold desc="************ update job and contactable ****************">
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

Assignment.after.update(function(userId, doc, fieldNames, modifier, options){
  if (doc.employee != this.previous.employee){

    Contactables.update({
      _id: this.previous.employee
    }, {
      $set: {
        assignment: null
      }
    });

    Contactables.update({
      _id: doc.employee
    }, {
      $set: {
        assignment: doc._id
      }
    });
  }

});
//</editor-fold>