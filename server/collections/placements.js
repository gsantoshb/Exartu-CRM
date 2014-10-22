PlacementView = new View('placements', {
  collection: Placements,
  mapping: function(placement) {
    var job = Jobs.find({_id: placement.job }),
      result = [job, Contactables.find({_id: placement.employee })];

    job.forEach(function(job){
      if (job.customer)
        result.push(Contactables.find(job.customer))
    });
    return result;
  }
});
Meteor.paginatedPublish(PlacementView, function(){
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return false;
  return Utils.filterCollectionByUserHier.call(this, PlacementView.find());
}, {
  pageSize: 3,
  publicationName: 'placements'
});

Meteor.publish('placementDetails', function (id) {
  return Utils.filterCollectionByUserHier.call(this, PlacementView.find(id));
});

Meteor.publish('allPlacements', function () {
  return Utils.filterCollectionByUserHier.call(this, PlacementView.find({},{
    fields: {
      status: 1,
      employee: 1,
      job: 1
    }
}));
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
