Meteor.publish('candidates', function () {

    if (!this.userId)
        return false;
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    return Candidates.find({
        $or: filterByHiers(user.hierId)
    });
});
Candidates.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Candidates.before.insert(function(userId, doc, fieldNames, modifier, options){
  var job= Jobs.findOne({ _id: doc.job });
  if (! job)
    return false;

  if (job.candidate)
    return false;

  var user = Meteor.user();
  doc.hierId = user.hierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
});

//<editor-fold desc="************ update job and contactable ****************">
Candidates.after.insert(function(userId, doc, fieldNames, modifier, options){
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            candidate: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            candidate: doc._id
        }
    });
});

Candidates.after.update(function(userId, doc, fieldNames, modifier, options){
  if (doc.employee != this.previous.employee){

    Contactables.update({
      _id: this.previous.employee
    }, {
      $set: {
        candidate: null
      }
    });

    Contactables.update({
      _id: doc.employee
    }, {
      $set: {
        candidate: doc._id
      }
    });
  }

});
//</editor-fold>