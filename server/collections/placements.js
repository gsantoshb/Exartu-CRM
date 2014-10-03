Meteor.publish('placements', function () {
  return Utils.filterCollectionByUserHier.call(this, Placements.find());
});

Meteor.startup(function () {
  Meteor.methods({
    addPlacement: function (placement) {
      return Placements.insert(placement);
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
  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.npmRequire('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
});

Placements.after.insert(function(userId, doc){
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

Placements.after.update(function(userId, doc){
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