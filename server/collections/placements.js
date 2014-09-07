Meteor.publish('placements', function () {

    if (!this.userId)
        return false;
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    return Placements.find({
        $or: filterByHiers(user.hierId)
    });
});

Meteor.startup(function () {
  Meteor.methods({
    addPlacement: function (asg) {
      if (true) {
        asg._id = new Meteor.Collection.ObjectID()._str;
        Placements.insert(asg);
        return asg;
      }
    }
  })
});

Placements.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Placements.before.insert(function (userId, doc) {
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
Placements.after.insert(function(userId, doc, fieldNames, modifier, options){
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            placement: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            placement: doc._id
        }
    });
});

Placements.after.update(function(userId, doc, fieldNames, modifier, options){
  if (doc.employee != this.previous.employee){

    Contactables.update({
      _id: this.previous.employee
    }, {
      $set: {
        placement: null
      }
    });

    Contactables.update({
      _id: doc.employee
    }, {
      $set: {
        placement: doc._id
      }
    });
  }

});
var extendPlacement = function (placement, objTypes) {
  if (!placement.contactMethods)
    placement.contactMethods = [];

  _.forEach(objTypes, function (objType) {
    if (objType) {
      _.forEach(objType.services, function (service) {
        if (placement[service] == undefined)
          placement[service] = [];
      });
    }
  })
};
//</editor-fold>