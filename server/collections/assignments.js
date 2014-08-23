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

Meteor.startup(function () {
  Meteor.methods({
    addAssignment: function (asg) {
      if (true) {
        asg._id = new Meteor.Collection.ObjectID()._str;
        Assignments.insert(asg);
        return asg;
      }
    }
  })
});

Assignments.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Assignments.before.insert(function (userId, doc) {
  try{
    var user = Meteor.user() || {};
  }catch (e){
    //when the insert is trigger from the server
    var user= { }
  }
  doc.hierId = user.hierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.require('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
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