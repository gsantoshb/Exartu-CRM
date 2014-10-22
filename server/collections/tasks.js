TaskView = new View('tasks', {
  collection: Tasks,
  mapping: function(task) {
    var contactablesIds = [];
    var jobsIds = [];
    var dealsIds = [];
    var placementsIds = [];

    _.forEach(task.links, function(link){
      switch (link.type){
        case Enums.linkTypes.contactable.value:
          return contactablesIds.push(link.id);
        case Enums.linkTypes.job.value:
          return jobsIds.push(link.id);
        case Enums.linkTypes.deal.value:
          return dealsIds.push(link.id);
        case Enums.linkTypes.placement.value:
          return placementsIds.push(link.id);
        case Enums.linkTypes.candidate.value:
          return placementsIds.push(link.id);
      }
    });

    var cursors = [];
    if (! _.isEmpty(contactablesIds)){
      cursors.push(Contactables.find({_id: {$in: contactablesIds}}));
    }
    if (! _.isEmpty(jobsIds)){
      cursors.push(Jobs.find({_id: {$in: jobsIds}}));
    }
    if (! _.isEmpty(dealsIds)){
      cursors.push(Deals.find({_id: {$in: dealsIds}}));
    }
    if (! _.isEmpty(placementsIds)){
      cursors.push(Placements.find({_id: {$in: placementsIds}}));
    }
    return cursors;
  }
});

Meteor.paginatedPublish(TaskView, function () {
  return Utils.filterCollectionByUserHier.call(this, TaskView.find({},{
    sort: { dateCreated: -1 }
  }));
},{
  pageSize: 20
});

Tasks.allow({
  update: function () {
    return true;
  },
  insert: function () {
    return true;
  }
});

Tasks.before.insert(function (userId, doc) {
  var user = Meteor.user();
  doc.hierId = user.currentHierId;
  doc.userId = user._id;
  doc.dateCreated = Date.now();
});

// Indexes

Tasks._ensureIndex({hierId: 1});
Tasks._ensureIndex({assign: 1});
Tasks._ensureIndex({userId: 1});