Meteor.publish('matchups', function () {

    if (!this.userId)
        return false;
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    return Matchups.find({
        $or: filterByHiers(user.hierId)
    });
});

Meteor.startup(function () {
  Meteor.methods({
    addMatchup: function (asg) {
      if (true) {
        asg._id = new Meteor.Collection.ObjectID()._str;
        Matchups.insert(asg);
        return asg;
      }
    }
  })
});

Matchups.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Matchups.before.insert(function (userId, doc) {
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
Matchups.after.insert(function(userId, doc, fieldNames, modifier, options){
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            matchup: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            matchup: doc._id
        }
    });
});

Matchups.after.update(function(userId, doc, fieldNames, modifier, options){
  if (doc.employee != this.previous.employee){

    Contactables.update({
      _id: this.previous.employee
    }, {
      $set: {
        matchup: null
      }
    });

    Contactables.update({
      _id: doc.employee
    }, {
      $set: {
        matchup: doc._id
      }
    });
  }

});
var extendMatchup = function (matchup, objTypes) {
  if (!matchup.contactMethods)
    matchup.contactMethods = [];

  _.forEach(objTypes, function (objType) {
    if (objType) {
      _.forEach(objType.services, function (service) {
        if (matchup[service] == undefined)
          matchup[service] = [];
      });
    }
  })
};
//</editor-fold>