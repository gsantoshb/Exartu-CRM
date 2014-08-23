Meteor.publish('assignments', function () {

    if (!this.userId)
        return false;
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    return Assignments.find({
        $or: filterByHiers(user.hierId)
    });
});
Assignments.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Assignments.before.insert(function(userId, doc, fieldNames, modifier, options){
  var job= Jobs.findOne({ _id: doc.job });
  if (! job)
    return false;
  var user = Meteor.user();
  if (user == null)
    throw new Meteor.Error(401, "Please sign in");

  if (!doc.objNameArray || !doc.objNameArray.length) {
    console.error('the assignment must have at least one objName');
    throw new Meteor.Error(401, "invalid assignment");
  }
  var objTypes = ObjTypes.find({
    objName: {
      $in: doc.objNameArray
    }
  }).fetch();
  
  var user = Meteor.user();
  doc.hierId = user.hierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
  extendAssignment(doc, objTypes)

});

//<editor-fold desc="************ update job and contactable ****************">
Assignments.after.insert(function(userId, doc, fieldNames, modifier, options){
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

Assignments.after.update(function(userId, doc, fieldNames, modifier, options){
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
var extendAssignment = function (assignment, objTypes) {
  if (!assignment.contactMethods)
    assignment.contactMethods = [];

  _.forEach(objTypes, function (objType) {
    if (objType) {
      _.forEach(objType.services, function (service) {
        if (assignment[service] == undefined)
          assignment[service] = [];
      });
    }
  })
};
//</editor-fold>