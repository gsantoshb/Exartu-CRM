Meteor.publish('candidate', function () {

    if (!this.userId)
        return false;

    return Candidate.find();
});
Candidate.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Candidate.before.insert(function(userId, doc, fieldNames, modifier, options){
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
Candidate.after.insert(function(userId, doc, fieldNames, modifier, options){
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

Candidate.after.update(function(userId, doc, fieldNames, modifier, options){
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